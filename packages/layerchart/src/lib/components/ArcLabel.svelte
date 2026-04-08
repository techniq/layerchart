<script lang="ts" module>
  import type { PathProps } from './Path.svelte';
  import type { TextProps } from './Text.svelte';
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
    /**
     * The placement of the label.
     * @default 'centroid'
     */
    placement?: ArcLabelPlacement;

    /**
     * Length of the radial portion of the callout leader line (from the outer
     * arc edge outward to the bend point).
     * @default 16
     */
    calloutLineLength?: number;

    /**
     * Length of the horizontal portion of the callout leader line after the
     * bend before the label text.
     * @default 12
     */
    calloutLabelOffset?: number;

    /**
     * Padding between the bend point on the leader line and the label text.
     * @default 4
     */
    calloutPadding?: number;

    /**
     * Props applied to the leader line `<Path>` when using `callout` placement.
     * Because `<Path>` is used (instead of a raw `<polyline>`), the leader line
     * renders in SVG and Canvas chart layers alike.
     */
    line?: Omit<PathProps, 'pathData'>;

    /**
     * Radial offset for the label, interpreted per-placement:
     * - `centroid` / `centroid-rotated` / `centroid-radial`: shifts the label
     *   radially from the arc centroid (positive = outward).
     * - `inner` / `middle` / `outer`: added to `outerPadding` (padding of the
     *   arc path the text runs along).
     * - `callout`: added to `calloutLineLength` (radial portion of the leader
     *   line).
     * @default 0
     */
    offset?: number;
  } & ArcTextOptions &
    Omit<TextProps, 'path'>;

  export type ArcLabelProps = {
    /**
     * Function returned from the `Arc` children snippet used to position the
     * label for `inner`, `middle`, `outer`, and `outer-radial` placements.
     */
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
</script>

<script lang="ts">
  import Path from './Path.svelte';
  import Text from './Text.svelte';
  import { radiansToDegrees } from '$lib/utils/math.js';

  let {
    getArcTextProps,
    centroid,
    startAngle,
    endAngle,
    innerRadius,
    outerRadius,
    placement = 'centroid',
    startOffset,
    outerPadding,
    calloutLineLength = 16,
    calloutLabelOffset = 12,
    calloutPadding = 4,
    line,
    offset = 0,
    ...restProps
  }: ArcLabelProps = $props();

  const midAngle = $derived(
    startAngle != null && endAngle != null ? (startAngle + endAngle) / 2 : 0
  );

  // Offset the centroid radially along the mid-angle direction.
  // Used by the `centroid` / `centroid-rotated` / `centroid-radial` placements.
  const offsetCentroid = $derived.by(() => {
    if (!centroid) return centroid;
    if (!offset || startAngle == null || endAngle == null) return centroid;
    const angle = midAngle - Math.PI / 2;
    return [centroid[0] + Math.cos(angle) * offset, centroid[1] + Math.sin(angle) * offset] as [
      number,
      number,
    ];
  });

  // Route the shared `offset` to the placement-appropriate radial padding:
  // - `outer`: outward from the outer edge (`outerPadding`)
  // - `inner`: inward from the inner edge (`innerPadding`)
  // - `middle`: both, so the middle path shifts by half in each direction
  const effectiveOuterPadding = $derived.by(() => {
    const base = outerPadding ?? 0;
    if (placement === 'outer') return base + offset;
    if (placement === 'middle') return base + offset;
    return base;
  });
  const effectiveInnerPadding = $derived.by(() => {
    if (placement === 'inner') return offset;
    if (placement === 'middle') return offset;
    return 0;
  });
  // `calloutLineLength` for `callout` placement gets the shared `offset` added
  // on top of the default/explicit length.
  const effectiveCalloutLineLength = $derived(calloutLineLength + offset);

  // Rotation in degrees to apply to the text at the centroid.
  // - `centroid-rotated`: follow the arc tangent direction
  // - `centroid-radial`: read radially outward (center → outer edge)
  const centroidRotation = $derived.by(() => {
    if (startAngle == null || endAngle == null) return 0;
    let deg = radiansToDegrees(midAngle);
    if (placement === 'centroid-radial') {
      // Rotate so text reads along the radial direction
      deg = deg - 90;
    } else if (placement !== 'centroid-rotated') {
      return 0;
    }
    // Normalize to [-180, 180]
    deg = ((deg + 180) % 360) - 180;
    // Flip text on the side where it would be upside-down so it remains readable
    if (deg > 90) deg -= 180;
    else if (deg < -90) deg += 180;
    return deg;
  });

  const calloutGeometry = $derived.by(() => {
    if (placement !== 'callout' || startAngle == null || endAngle == null || outerRadius == null) {
      return null;
    }

    // Match d3-shape arc convention: 0 radians = 12 o'clock, increasing clockwise.
    const angle = midAngle - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Point on the outer arc edge at the mid-angle
    const x0 = cos * outerRadius;
    const y0 = sin * outerRadius;

    // Bend point: extend radially outward from the edge
    const bendRadius = outerRadius + effectiveCalloutLineLength;
    const x1 = cos * bendRadius;
    const y1 = sin * bendRadius;

    // Label point: extend horizontally toward the chart side the arc lives on
    const onRightSide = cos >= 0;
    const x2 = x1 + (onRightSide ? calloutLabelOffset : -calloutLabelOffset);
    const y2 = y1;

    return {
      pathData: `M${x0},${y0}L${x1},${y1}L${x2},${y2}`,
      labelX: x2 + (onRightSide ? calloutPadding : -calloutPadding),
      labelY: y2,
      textAnchor: (onRightSide ? 'start' : 'end') as 'start' | 'end',
    };
  });

  const arcTextProps = $derived.by(() => {
    if (placement === 'centroid') {
      if (offsetCentroid) {
        return {
          x: offsetCentroid[0],
          y: offsetCentroid[1],
          textAnchor: 'middle' as const,
          verticalAnchor: 'middle' as const,
        };
      }
      return getArcTextProps?.('centroid', { startOffset, outerPadding }) ?? {};
    }

    if (placement === 'centroid-rotated' || placement === 'centroid-radial') {
      if (offsetCentroid) {
        return {
          x: offsetCentroid[0],
          y: offsetCentroid[1],
          textAnchor: 'middle' as const,
          verticalAnchor: 'middle' as const,
          transform: `rotate(${centroidRotation}, ${offsetCentroid[0]}, ${offsetCentroid[1]})`,
        };
      }
      return getArcTextProps?.('centroid', { startOffset, outerPadding }) ?? {};
    }

    if (placement === 'callout') {
      const g = calloutGeometry;
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

    // inner / middle / outer
    return (
      getArcTextProps?.(placement, {
        startOffset,
        outerPadding: effectiveOuterPadding,
        innerPadding: effectiveInnerPadding,
      }) ?? {}
    );
  });
</script>

{#if placement === 'callout' && calloutGeometry}
  <Path pathData={calloutGeometry.pathData} {...line} />
{/if}

<Text {...arcTextProps} {...restProps} />
