/**
 * Reactive utilities to create and position text for Arc-based labels/annotations.
 */

import { arc as d3arc } from 'd3-shape';
import type { Getter, GetterValues } from './types.js';
import { radiansToDegrees } from './math.js';
import type { ComponentProps } from 'svelte';
import type { Text } from '$lib/components/index.js';

function extractOutsideArc(arcPath: string) {
  // Extract first arc until straight line to innerRadius (L) or close path (Z)
  const matches = arcPath.match(/(^.+?)(L|Z)/);
  if (!matches || !matches[1]) return arcPath;
  return matches[1];
}

// Normalize angles to [0, 360) range
function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export type ArcTextProps = GetterValues<{
  innerRadius: number;
  outerRadius: number;
  cornerRadius: number;
  startAngle: number;
  endAngle: number;
  centroid: [number, number];
}>;

export type InternalArcTextProps = ArcTextProps & {
  /**
   * Whether the corner radius should be inverted or not.
   * This changes when text is rotated/flipped to ensure
   * the corner offset is applied correctly.
   */
  invertCorner: Getter<boolean>;
};

export type ArcPathResult = { current: string };

/**
 * Calculates and generates a path in the middle/medial line of an arc.
 */
function getArcPathMiddle(props: InternalArcTextProps): ArcPathResult {
  const centerRadius = $derived((props.innerRadius() + props.outerRadius()) / 2);
  const cornerAngleOffset = $derived.by(() => {
    if (props.cornerRadius() <= 0 || centerRadius <= 0) return 0;

    const effectiveCornerRadius = Math.min(props.cornerRadius(), centerRadius);
    return (effectiveCornerRadius * 0.5) / centerRadius;
  });

  const effectiveStartAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.startAngle() - cornerAngleOffset;
    }
    return props.startAngle() + cornerAngleOffset;
  });

  const effectiveEndAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.endAngle() + cornerAngleOffset;
    }
    return props.endAngle() - cornerAngleOffset;
  });

  const path = $derived(
    extractOutsideArc(
      d3arc()
        .outerRadius(centerRadius)
        .innerRadius(centerRadius - 0.5)
        .startAngle(effectiveStartAngle)
        .endAngle(effectiveEndAngle)() ?? ''
    )
  );

  return {
    get current() {
      return path;
    },
  };
}

function getArcPathInner(props: InternalArcTextProps): ArcPathResult {
  const cornerAngleOffset = $derived.by(() => {
    if (props.cornerRadius() <= 0 || props.innerRadius() <= 0) return 0;

    if (props.cornerRadius() >= props.innerRadius()) return Math.PI / 4;
    return (props.cornerRadius() * 0.5) / props.innerRadius();
  });

  const effectiveStartAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.startAngle() - cornerAngleOffset;
    }
    return props.startAngle() + cornerAngleOffset;
  });

  const effectiveEndAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.endAngle() + cornerAngleOffset;
    }
    return props.endAngle() - cornerAngleOffset;
  });

  const path = $derived(
    extractOutsideArc(
      d3arc()
        .innerRadius(props.innerRadius())
        .outerRadius(props.innerRadius() + 0.5)
        .startAngle(effectiveStartAngle)
        .endAngle(effectiveEndAngle)() ?? ''
    )
  );

  return {
    get current() {
      return path;
    },
  };
}

function getArcPathOuter(props: InternalArcTextProps): ArcPathResult {
  const cornerAngleOffset = $derived.by(() => {
    if (props.cornerRadius() <= 0 || props.outerRadius() <= 0) return 0;
    return (props.cornerRadius() * 0.5) / props.outerRadius();
  });

  const effectiveStartAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.startAngle() - cornerAngleOffset;
    }
    return props.startAngle() + cornerAngleOffset;
  });

  const effectiveEndAngle = $derived.by(() => {
    if (props.invertCorner()) {
      return props.endAngle() + cornerAngleOffset;
    }
    return props.endAngle() - cornerAngleOffset;
  });

  const path = $derived(
    extractOutsideArc(
      d3arc()
        .innerRadius(props.outerRadius() - 0.5)
        .outerRadius(props.outerRadius())
        .startAngle(effectiveStartAngle)
        .endAngle(effectiveEndAngle)() ?? ''
    )
  );

  return {
    get current() {
      return path;
    },
  };
}

export type ArcTextPosition = 'inner' | 'outer' | 'middle' | 'centroid';

export type ArcTextOptions = {
  /**
   * A percentage string (e.g., '50%') to offset the start angle of the text path.
   * If a specific offset is needed, you should use option rather than passing it
   * directly to the `<Text>` component to ensure it is taken into account when
   * calculating the path the text should follow.
   *
   * This has no effect if the position is `'centroid'`.
   */
  startOffset?: string;
};

export function createGetArcTextProps(
  props: ArcTextProps,
  opts: ArcTextOptions = {},
  position: ArcTextPosition
) {
  const effectiveStartAngleRadians = $derived.by(() => {
    const start = props.startAngle();
    const end = props.endAngle();
    const offset = opts.startOffset;

    if (offset) {
      try {
        const percentage = parseFloat(offset.slice(0, -1)) / 100;
        if (!isNaN(percentage) && percentage >= 0 && percentage <= 1) {
          const span = end - start;
          return start + span * percentage;
        } else {
          console.warn('Invalid percentage for startOffset:', offset);
        }
      } catch (e) {
        console.warn('Could not parse startOffset percentage:', offset, e);
      }
    }

    return start;
  });

  // Convert the effective start angle to degrees for orientation checks
  const effectiveStartDegrees = $derived(radiansToDegrees(effectiveStartAngleRadians));
  // Normalize the effective angle to the [0, 360) range
  const normalizedStartDegrees = $derived(normalizeAngle(effectiveStartDegrees));

  const startDegrees = $derived(radiansToDegrees(props.startAngle()));
  const endDegrees = $derived(radiansToDegrees(props.endAngle()));

  const isClockwise = $derived(startDegrees < endDegrees);

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

  const innerPath = getArcPathInner(pathGenProps);
  const middlePath = getArcPathMiddle(pathGenProps);
  const outerPath = getArcPathOuter(pathGenProps);

  const innerDominantBaseline = $derived.by(() => {
    if (isBottomCw || isBottomCcw) return 'auto';
    if (isTopCw || isTopCcw) return 'hanging';
    return 'auto';
  });

  const outerDominantBaseline = $derived.by(() => {
    if (isBottomCw || isBottomCcw) return 'hanging';
    return undefined;
  });

  const sharedProps = $derived.by(() => {
    if (reverseText) {
      return {
        startOffset: opts.startOffset ?? '100%',
        textAnchor: 'end' as const,
      };
    }
    return {
      startOffset: opts.startOffset ?? undefined,
    };
  });

  const current = $derived.by(() => {
    if (position === 'inner') {
      return {
        path: innerPath.current,
        ...sharedProps,
        'dominant-baseline': innerDominantBaseline,
      };
    } else if (position === 'outer') {
      return {
        path: outerPath.current,
        ...sharedProps,
        'dominant-baseline': outerDominantBaseline,
      };
    } else if (position === 'middle') {
      return {
        path: middlePath.current,
        ...sharedProps,
        'dominant-baseline': 'middle' as const,
      };
    } else {
      const centroid = props.centroid();
      return {
        x: centroid[0],
        y: centroid[1],
        textAnchor: 'middle' as const,
        verticalAnchor: 'middle' as const,
      };
    }
  });

  return {
    get current() {
      return current;
    },
  };
}

export type GetArcTextProps = (
  position: ArcTextPosition,
  opts?: ArcTextOptions
) => ComponentProps<typeof Text>;
