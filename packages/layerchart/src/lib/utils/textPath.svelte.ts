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

type InternalTextPathProps = TextPathProps & {
  invertCorner: () => boolean;
};

function getArcMiddlePath(props: InternalTextPathProps) {
  const centerRadius = $derived((props.innerRadius() + props.outerRadius()) / 2);
  const cornerAngleOffset = $derived.by(() => {
    if (props.cornerRadius() <= 0 || centerRadius <= 0) return 0;
    // basic approximation - angle = arcLength / radius
    // ensure cornerRadius isn't larger than the center radius itself for this
    return props.cornerRadius() / centerRadius;
  });

  const middlelineStartAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.startAngle() - cornerAngleOffset;
    }
    return props.startAngle() + cornerAngleOffset;
  });

  const middlelineEndAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.endAngle() + cornerAngleOffset;
    }
    return props.endAngle() - cornerAngleOffset;
  });

  const middlelinePath = $derived(
    extractOutsideArc(
      d3arc()
        .outerRadius(centerRadius)
        .innerRadius(centerRadius - 0.5)
        .startAngle(middlelineStartAngle)
        .endAngle(middlelineEndAngle)() ?? ''
    )
  );

  return {
    get current() {
      return middlelinePath;
    },
  };
}

function extractOutsideArc(arcPath: string) {
  // Extract first arc until straight line to innerRadius (L) or close path (Z)
  const matches = arcPath.match(/(^.+?)(L|Z)/);
  if (!matches || !matches[1]) return arcPath;
  return matches[1];
}

function getArcInnerPath(props: InternalTextPathProps) {
  const innerCornerAngleOffset = $derived.by(() => {
    if (props.cornerRadius() <= 0 || props.innerRadius() <= 0) return 0;
    // ensure corner radius isn't larger than the radius itself for approx.
    if (props.cornerRadius() >= props.innerRadius()) return Math.PI / 2;
    // approx: angle = arcLength / radius
    return props.cornerRadius() / props.innerRadius();
  });

  const innerlineStartAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.startAngle() - innerCornerAngleOffset;
    }
    return props.startAngle() + innerCornerAngleOffset;
  });

  const innerlineEndAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.endAngle() + innerCornerAngleOffset;
    }
    return props.endAngle() - innerCornerAngleOffset;
  });

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

function getArcOuterPath(props: InternalTextPathProps) {
  const outerCornerAngleOffset = $derived.by(() => {
    if (props.cornerRadius() <= 0 || props.outerRadius() <= 0) return 0;
    // basic approximation: angle = arcLength / radius
    // unlike the inner radius case, we shouldn't need to cap this
    // as outerRadius is usually larger than cornerRadius.
    return props.cornerRadius() / props.outerRadius();
  });

  const outerlineStartAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.startAngle() - outerCornerAngleOffset;
    }
    return props.startAngle() + outerCornerAngleOffset;
  });

  const outerlineEndAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.endAngle() + outerCornerAngleOffset;
    }
    return props.endAngle() - outerCornerAngleOffset;
  });

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
    invertCorner: () => isBottomCw || isBottomCcw,
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
        'dominant-baseline': 'middle',
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
