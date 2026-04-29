import { radiansToDegrees } from '$lib/utils/math.js';
import type { PathProps } from '../Path/Path.shared.svelte.js';
import type { TextProps } from '../Text/Text.shared.svelte.js';
import type { GetArcTextProps, ArcTextOptions } from '$lib/utils/arcText.svelte.js';

/**
 * Placement options for `ArcLabel`.
 * - `centroid`: at the arc centroid (horizontal text)
 * - `centroid-rotated`: at the arc centroid, rotated to follow the arc tangent
 * - `centroid-radial`: at the arc centroid, rotated to read radially (center → outside)
 * - `inner` / `middle` / `outer`: along the inner / middle / outer arc path
 * - `callout`: outside the arc connected by a polyline with a bend
 */
export type ArcLabelPlacement =
  | 'centroid'
  | 'centroid-rotated'
  | 'centroid-radial'
  | 'inner'
  | 'middle'
  | 'outer'
  | 'callout';

export type ArcLabelConfig = {
  /** @default 'centroid' */
  placement?: ArcLabelPlacement;
  /** @default 16 */
  calloutLineLength?: number;
  /** @default 12 */
  calloutLabelOffset?: number;
  /** @default 4 */
  calloutPadding?: number;
  /** Props applied to the leader line `<Path>` when using `callout` placement. */
  line?: Omit<PathProps, 'pathData'>;
  /** Radial offset for the label, interpreted per-placement. @default 0 */
  offset?: number;
} & ArcTextOptions &
  Omit<TextProps, 'path'>;

export type ArcLabelProps = {
  /** Function from `Arc` children snippet for `inner`/`middle`/`outer` placements. */
  getArcTextProps?: GetArcTextProps;
  /** Centroid `[x, y]` of the arc (from `Arc` children snippet) */
  centroid?: [number, number];
  /** Arc start angle in radians (from `Arc` children snippet) */
  startAngle?: number;
  /** Arc end angle in radians (from `Arc` children snippet) */
  endAngle?: number;
  /** Arc inner radius (from `Arc` children snippet) */
  innerRadius?: number;
  /** Arc outer radius (from `Arc` children snippet) */
  outerRadius?: number;
} & ArcLabelConfig;

export type ArcLabelCalloutGeometry = {
  pathData: string;
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'end';
};

/**
 * Reactive state shared by every per-layer ArcLabel variant. Holds derived
 * geometry (callout path, offset centroid, rotation) and resolved text props.
 */
export class ArcLabelState {
  #getProps: () => ArcLabelProps = () => ({}) as ArcLabelProps;

  constructor(getProps: () => ArcLabelProps) {
    this.#getProps = getProps;
  }

  midAngle = $derived.by(() => {
    const { startAngle, endAngle } = this.#getProps();
    return startAngle != null && endAngle != null ? (startAngle + endAngle) / 2 : 0;
  });

  offsetCentroid = $derived.by<[number, number] | undefined>(() => {
    const { centroid, offset = 0, startAngle, endAngle } = this.#getProps();
    if (!centroid) return centroid;
    if (!offset || startAngle == null || endAngle == null) return centroid;
    const angle = this.midAngle - Math.PI / 2;
    return [centroid[0] + Math.cos(angle) * offset, centroid[1] + Math.sin(angle) * offset];
  });

  effectiveOuterPadding = $derived.by(() => {
    const props = this.#getProps();
    const base = props.outerPadding ?? 0;
    if (props.placement === 'outer' || props.placement === 'middle') {
      return base + (props.offset ?? 0);
    }
    return base;
  });

  effectiveInnerPadding = $derived.by(() => {
    const props = this.#getProps();
    if (props.placement === 'inner' || props.placement === 'middle') return props.offset ?? 0;
    return 0;
  });

  effectiveCalloutLineLength = $derived(
    (this.#getProps().calloutLineLength ?? 16) + (this.#getProps().offset ?? 0)
  );

  centroidRotation = $derived.by(() => {
    const { startAngle, endAngle, placement } = this.#getProps();
    if (startAngle == null || endAngle == null) return 0;
    let deg = radiansToDegrees(this.midAngle);
    if (placement === 'centroid-radial') {
      deg = deg - 90;
    } else if (placement !== 'centroid-rotated') {
      return 0;
    }
    deg = ((deg + 180) % 360) - 180;
    if (deg > 90) deg -= 180;
    else if (deg < -90) deg += 180;
    return deg;
  });

  calloutGeometry = $derived.by<ArcLabelCalloutGeometry | null>(() => {
    const {
      placement,
      startAngle,
      endAngle,
      outerRadius,
      calloutLabelOffset = 12,
      calloutPadding = 4,
    } = this.#getProps();
    if (placement !== 'callout' || startAngle == null || endAngle == null || outerRadius == null) {
      return null;
    }

    const angle = this.midAngle - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x0 = cos * outerRadius;
    const y0 = sin * outerRadius;

    const bendRadius = outerRadius + this.effectiveCalloutLineLength;
    const x1 = cos * bendRadius;
    const y1 = sin * bendRadius;

    const onRightSide = cos >= 0;
    const x2 = x1 + (onRightSide ? calloutLabelOffset : -calloutLabelOffset);
    const y2 = y1;

    return {
      pathData: `M${x0},${y0}L${x1},${y1}L${x2},${y2}`,
      labelX: x2 + (onRightSide ? calloutPadding : -calloutPadding),
      labelY: y2,
      textAnchor: onRightSide ? 'start' : 'end',
    };
  });

  arcTextProps = $derived.by(() => {
    const props = this.#getProps();
    const { placement = 'centroid', startOffset, outerPadding, getArcTextProps } = props;

    if (placement === 'centroid') {
      if (this.offsetCentroid) {
        return {
          x: this.offsetCentroid[0],
          y: this.offsetCentroid[1],
          textAnchor: 'middle' as const,
          verticalAnchor: 'middle' as const,
        };
      }
      return getArcTextProps?.('centroid', { startOffset, outerPadding }) ?? {};
    }

    if (placement === 'centroid-rotated' || placement === 'centroid-radial') {
      if (this.offsetCentroid) {
        return {
          x: this.offsetCentroid[0],
          y: this.offsetCentroid[1],
          textAnchor: 'middle' as const,
          verticalAnchor: 'middle' as const,
          rotate: this.centroidRotation,
        };
      }
      return getArcTextProps?.('centroid', { startOffset, outerPadding }) ?? {};
    }

    if (placement === 'callout') {
      const g = this.calloutGeometry;
      if (g) {
        return {
          x: g.labelX,
          y: g.labelY,
          textAnchor: g.textAnchor,
          verticalAnchor: 'middle' as const,
        };
      }
      return {};
    }

    return (
      getArcTextProps?.(placement, {
        startOffset,
        outerPadding: this.effectiveOuterPadding,
        innerPadding: this.effectiveInnerPadding,
      }) ?? {}
    );
  });
}
