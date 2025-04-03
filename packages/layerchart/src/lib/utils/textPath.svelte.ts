import type { GetterValues } from './types.js';
import { arc as d3arc } from 'd3-shape';

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
  const safeCenterlineEndAngle = $derived(Math.max(centerlineStartAngle, centerlineEndAngle));

  const centerlinePath = $derived(
    d3arc()
      .outerRadius(centerRadius)
      .innerRadius(centerRadius - 0.5)
      .startAngle(centerlineStartAngle)
      .endAngle(safeCenterlineEndAngle)() ?? ''
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
  const safeInnerlineEndAngle = $derived(Math.max(innerlineStartAngle, innerlineEndAngle));

  const innerlinePath = $derived(
    d3arc()
      .innerRadius(props.innerRadius())
      .outerRadius(props.innerRadius() + 0.5)
      .startAngle(innerlineStartAngle)
      .endAngle(safeInnerlineEndAngle)() ?? ''
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
  const safeOuterlineEndAngle = $derived(Math.max(outerlineStartAngle, outerlineEndAngle));

  const outerlinePath = $derived(
    d3arc()
      .innerRadius(props.outerRadius() - 0.5)
      .outerRadius(props.outerRadius())
      .startAngle(outerlineStartAngle)
      .endAngle(safeOuterlineEndAngle)() ?? ''
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
};

export function getArcTextPaths(props: TextPathProps): ArcTextPaths {
  const inner = getArcInnerPath(props);
  const centroid = getArcCentroidPath(props);
  const outer = getArcOuterPath(props);

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
