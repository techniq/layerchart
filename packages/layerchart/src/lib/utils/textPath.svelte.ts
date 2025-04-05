import type { ComponentProps } from 'svelte';
import type { GetterValues } from './types.js';
import { arc as d3arc } from 'd3-shape';
import type Text from '$lib/components/Text.svelte';
import { radiansToDegrees } from './math.js';

type TextPathProps = GetterValues<{
  innerRadius: number;
  outerRadius: number;
  cornerRadius: number;
  startAngle: number;
  endAngle: number;
}>;

function getArcMiddlePath(props: TextPathProps) {
  const centerRadius = $derived((props.innerRadius() + props.outerRadius()) / 2);
  const cornerAngleOffset = $derived.by(() => {
    if (props.cornerRadius() <= 0 || centerRadius <= 0) return 0;
    // basic approximation - angle = arcLength / radius
    // ensure cornerRadius isn't larger than the center radius itself for this
    return props.cornerRadius() / centerRadius;
  });

  const centerlineStartAngle = $derived(props.startAngle() + cornerAngleOffset);
  const centerlineEndAngle = $derived(props.endAngle() - cornerAngleOffset);

  const centerlinePath = $derived(
    extractOutsideArc(
      d3arc()
        .outerRadius(centerRadius)
        .innerRadius(centerRadius - 0.5)
        .startAngle(centerlineStartAngle)
        .endAngle(centerlineEndAngle)() ?? ''
    )
  );

  return {
    get current() {
      return centerlinePath;
    },
  };
}

function extractOutsideArc(arcPath: string) {
  // Extract first arc until straight line to innerRadius (L) or close path (Z)
  const matches = arcPath.match(/(^.+?)(L|Z)/);
  if (!matches || !matches[1]) return arcPath;
  return matches[1];
}

function getArcInnerPath(props: TextPathProps) {
  const innerCornerAngleOffset = $derived.by(() => {
    if (props.cornerRadius() <= 0 || props.innerRadius() <= 0) return 0;
    // ensure corner radius isn't larger than the radius itself for approx.
    if (props.cornerRadius() >= props.innerRadius()) return Math.PI / 2;
    // approx: angle = arcLength / radius
    return props.cornerRadius() / props.innerRadius();
  });

  const innerlineStartAngle = $derived(props.startAngle() + innerCornerAngleOffset);
  const innerlineEndAngle = $derived(props.endAngle() - innerCornerAngleOffset);

  // ensure adjust end angle doesn't cross over the start angle

  const innerlinePath = $derived(
    extractOutsideArc(
      d3arc()
        .innerRadius(props.innerRadius())
        .outerRadius(props.innerRadius() + 0.5)
        .startAngle(innerlineStartAngle)
        .endAngle(innerlineEndAngle)() ?? ''
    )
  );

  return {
    get current() {
      return innerlinePath;
    },
  };
}

function getArcOuterPath(props: TextPathProps) {
  const outerCornerAngleOffset = $derived.by(() => {
    if (props.cornerRadius() <= 0 || props.outerRadius() <= 0) return 0;
    // basic approximation: angle = arcLength / radius
    // unlike the inner radius case, we shouldn't need to cap this
    // as outerRadius is usually larger than cornerRadius.
    return props.cornerRadius() / props.outerRadius();
  });

  const outerlineStartAngle = $derived(props.startAngle() + outerCornerAngleOffset);
  const outerlineEndAngle = $derived(props.endAngle() - outerCornerAngleOffset);

  // ensure the adjusted end angle doesn't cross over the start angle

  const outerlinePath = $derived(
    extractOutsideArc(
      d3arc()
        .innerRadius(props.outerRadius() - 0.5)
        .outerRadius(props.outerRadius())
        .startAngle(outerlineStartAngle)
        .endAngle(outerlineEndAngle)() ?? ''
    )
  );

  return {
    get current() {
      return outerlinePath;
    },
  };
}

export type TextPathPosition = 'inner' | 'middle' | 'outer';

export type GetTextPathProps = (position: TextPathPosition) => ComponentProps<typeof Text>;

export function getArcTextPaths(props: TextPathProps): GetTextPathProps {
  const startDegrees = $derived(radiansToDegrees(props.startAngle()));
  const endDegrees = $derived(radiansToDegrees(props.endAngle()));

  const isClockwise = $derived(startDegrees < endDegrees);

  const normalizedStartDegrees = $derived(normalizeAngle(startDegrees));
  const normalizedEndDegrees = $derived(normalizeAngle(endDegrees));

  // Reverse direction of arc when text is on top going counterclockwise or bottom going clockwise
  const isTopCw = $derived(
    isClockwise && (normalizedStartDegrees >= 270 || normalizedStartDegrees <= 90)
  );
  const isTopCcw = $derived(
    !isClockwise && (normalizedStartDegrees > 270 || normalizedStartDegrees <= 90)
  );
  const isBottomCw = $derived(
    isClockwise && normalizedStartDegrees < 270 && normalizedStartDegrees >= 90
  );
  const isBottomCcw = $derived(
    !isClockwise && normalizedStartDegrees <= 270 && normalizedStartDegrees > 90
  );

  const reverseText = $derived(isTopCcw || isBottomCw);

  const pathGenProps = {
    ...props,
    startAngle: () => (reverseText ? props.endAngle() : props.startAngle()),
    endAngle: () => (reverseText ? props.startAngle() : props.endAngle()),
  };

  const innerPath = getArcInnerPath(pathGenProps);
  const middlePath = getArcMiddlePath(pathGenProps);
  const outerPath = getArcOuterPath(pathGenProps);

  function getInnerDominantBaseline() {
    if (isBottomCw || isBottomCcw) return 'auto';
    if (isTopCw || isTopCcw) return 'hanging';
    return 'auto';
  }

  const sharedProps = $derived.by(() => {
    if (reverseText) {
      return {
        startOffset: '100%',
        textAnchor: 'end' as const,
      };
    }
    return {};
  });

  function getTextPathProps(position: TextPathPosition) {
    if (position === 'inner') {
      return {
        path: innerPath.current,
        ...sharedProps,
        'dominant-baseline': getInnerDominantBaseline(),
      };
    } else if (position === 'outer') {
      return {
        path: outerPath.current,
        ...sharedProps,
        ...((isBottomCw || isBottomCcw) && { 'dominant-baseline': 'hanging' }),
      };
    } else {
      return {
        path: middlePath.current,
        ...sharedProps,
        ...((isBottomCw || isBottomCcw) && { 'dominant-baseline': 'middle' }),
      };
    }
  }

  return getTextPathProps;
}

export function getPathLength(pathRef: SVGPathElement | undefined) {
  if (pathRef && typeof pathRef.getTotalLength === 'function') {
    try {
      return pathRef.getTotalLength();
    } catch (e) {
      console.error('Error getting path length:', e);
      return 0;
    }
  }
  return 0;
}

// Normalize angles to [0, 360) range
function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}
