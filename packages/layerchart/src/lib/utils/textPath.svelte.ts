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

function getArcCentroidPath(props: TextPathProps) {
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

export type ArcTextPaths = {
  readonly inner: string;
  readonly centroid: string;
  readonly outer: string;
  /**
   * Props to apply to the `<Text>` component for the text path
   * that handle the start offset and text anchor based on the
   * arc direction.
   *
   * At the moment, only `startOffset` is used, but more properties may be added
   * in the future as use cases arise.
   *
   * - `startOffset` is set to "0%" for clockwise arcs and "50%" for counter-clockwise arcs
   * - `textAnchor` is set to "start" for clockwise arcs and "end" for counter-clockwise arcs
   */
  readonly textProps: Pick<ComponentProps<typeof Text>, 'startOffset' | 'textAnchor'>;
};

export function getArcTextPaths(props: TextPathProps): ArcTextPaths {
  // first we determine if the arc is going clockwise or counterclockwise,
  // this will determine where we position the text
  const isCounterClockwise = $derived(props.startAngle() > props.endAngle());

  const startDegrees = $derived(radiansToDegrees(props.startAngle()));
  const endDegrees = $derived(radiansToDegrees(props.endAngle()));

  const startNormalized = $derived(normalizeAngle(startDegrees));
  const endNormalized = $derived(normalizeAngle(endDegrees));

  // if the arc is going counterclockwise, we flip the angles
  // but we also need to consider the text direction based on whether it is in the bottom half

  // is in bottom half
  const isInBottomHalf = $derived.by(() => {
    const normalized = startNormalized;
    console.log('start Degrees', startDegrees);
    console.log('startNormalized', normalized);
    return normalized >= 90 && normalized < 270;
  });

  const pathGenProps = {
    ...props,
    startAngle: () => (isCounterClockwise ? props.endAngle() : props.startAngle()),
    endAngle: () => (isCounterClockwise ? props.startAngle() : props.endAngle()),
  };

  const needsTextReversal = $derived(
    (isInBottomHalf && isCounterClockwise) || (!isInBottomHalf && !isCounterClockwise)
  );

  const innerPath = getArcInnerPath(pathGenProps);
  const centroidPath = getArcCentroidPath(pathGenProps);
  const outerPath = getArcOuterPath(pathGenProps);

  // DO WE ALSO NEED TO CONSIDER THE FACT THAT WE ARE CCW SO WE NEED TO FLIP THE TEXT? IDK
  const startOffset = $derived(isInBottomHalf ? '100%' : '0%');
  const textAnchor = $derived(isInBottomHalf ? 'end' : 'start');

  return {
    get inner() {
      return innerPath.current;
    },
    get centroid() {
      return centroidPath.current;
    },
    get outer() {
      return outerPath.current;
    },
    get textProps() {
      return { startOffset, textAnchor };
    },
  };
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

type CircleHalf = 'top' | 'bottom' | 'both';

// Normalize angles to [0, 360) range
function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Determines if angles fall on the top half, bottom half, or both halves of a circle
 * @param startAngleDegrees - The starting angle in degrees
 * @param endAngleDegrees - The ending angle in degrees
 * @returns Which half of the circle the angles fall on
 */
function getCircleHalf(startAngleDegrees: number, endAngleDegrees: number): CircleHalf {
  const start = normalizeAngle(startAngleDegrees);
  let end = normalizeAngle(endAngleDegrees);

  // Handle case where end is before start in the normalized range
  if (end < start && end !== 0) {
    end += 360;
  }

  // When angles are equal or span full circle
  if (start === end || end - start >= 360) return 'both';

  // Check which half points are in
  const startInTop = start < 180;
  const endInTop = end % 360 < 180;
  const startInBottom = start >= 180 || start === 0;
  const endInBottom = end % 360 >= 180 || end === 0;

  // Check if arc spans across 180°
  const spansAcross180 = start < 180 && end > 180;

  if ((startInTop && endInBottom) || (startInBottom && endInTop) || spansAcross180) {
    return 'both';
  } else if (startInTop && endInTop) {
    return 'top';
  } else {
    // All remaining cases must be bottom half
    return 'bottom';
  }
}

type Direction = 'cw' | 'ccw';

/**
 * Determines the direction (clockwise or counterclockwise) of angle change
 * @param startAngleDegrees - The starting angle in degrees
 * @param endAngleDegrees - The ending angle in degrees
 * @returns Direction of angle change
 */
function getDirection(startAngleDegrees: number, endAngleDegrees: number): Direction {
  if (startAngleDegrees === endAngleDegrees) return 'cw';
  if (endAngleDegrees < startAngleDegrees) return 'ccw';
  return 'cw';
}

/**
 * Determines if text needs to be flipped based on starting position and direction
 * @param startAngle - The starting angle in degrees
 * @param endAngle - The ending angle in degrees
 * @returns true if text needs to be flipped, false otherwise
 */
function shouldFlipText(startAngle: number, endAngle: number): boolean {
  const normalizeAngle = (angle: number): number => {
    return ((angle % 360) + 360) % 360;
  };

  const start = normalizeAngle(startAngle);
  const isClockwise = getDirection(startAngle, endAngle) === 'cw';

  // Check if starting at bottom half (180-360 degrees)
  const startsAtBottom = start >= 180;

  // Flip text when:
  // 1. Going clockwise and starting at bottom, or
  // 2. Going counterclockwise and starting at top
  return (isClockwise && startsAtBottom) || (!isClockwise && !startsAtBottom);
}
