import type { ComponentProps } from 'svelte';
import type { GetterValues } from './types.js';
import { arc as d3arc } from 'd3-shape';
import type Text from '$lib/components/Text.svelte';

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
    d3arc()
      .outerRadius(centerRadius)
      .innerRadius(centerRadius - 0.5)
      .startAngle(centerlineStartAngle)
      .endAngle(centerlineEndAngle)() ?? ''
  );

  return {
    get current() {
      return centerlinePath;
    },
  };
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
    d3arc()
      .innerRadius(props.innerRadius())
      .outerRadius(props.innerRadius() + 0.5)
      .startAngle(innerlineStartAngle)
      .endAngle(innerlineEndAngle)() ?? ''
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
    d3arc()
      .innerRadius(props.outerRadius() - 0.5)
      .outerRadius(props.outerRadius())
      .startAngle(outerlineStartAngle)
      .endAngle(outerlineEndAngle)() ?? ''
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
   * - `text-anchor` is set to "start" for clockwise arcs and "end" for counter-clockwise arcs
   */
  readonly textProps: Pick<ComponentProps<typeof Text>, 'startOffset' | 'textAnchor'>;
};

export function getArcTextPaths(props: TextPathProps): ArcTextPaths {
  const needsFlip = $derived(props.endAngle() < props.startAngle());
  const start = $derived(needsFlip ? props.endAngle() : props.startAngle());
  const end = $derived(needsFlip ? props.startAngle() : props.endAngle());

  // 2. Create reactive props for path generation, swapping angles if needed
  const pathGenProps = {
    ...props,
    startAngle: () => start,
    endAngle: () => end,
  };

  const inner = getArcInnerPath(pathGenProps);
  const centroid = getArcCentroidPath(pathGenProps);
  const outer = getArcOuterPath(pathGenProps);

  const startOffset: ArcTextPaths['textProps']['startOffset'] = $derived(needsFlip ? '50%' : '0%');
  const textAnchor: ArcTextPaths['textProps']['textAnchor'] = $derived(needsFlip ? 'end' : 'start');

  return {
    get inner() {
      return inner.current;
    },
    get centroid() {
      return centroid.current;
    },
    get outer() {
      return outer.current;
    },
    get textProps() {
      return {
        startOffset: startOffset,
        textAnchor: textAnchor,
      };
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
