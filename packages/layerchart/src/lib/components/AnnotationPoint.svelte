<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import { isScaleBand, type SingleDomainType } from '$lib/utils/scales.svelte.js';

  export type AnnotationPointPropsWithoutHTML = {
    /** x value of the point */
    x?: SingleDomainType;

    /** y value of the point */
    y?: SingleDomainType;

    /** Radius of the circle */
    r?: number;

    /** Label to display on circle */
    label?: string;

    /** Placement of the label */
    labelPlacement?: Placement;

    /** X offset of the label */
    labelXOffset?: number;

    /** Y offset of the label */
    labelYOffset?: number;

    /**
     * Draw a `<Link>` from the ring edge to the label (d3-ring-note style).
     * Pass `true` for a straight line, or an object to configure the `Link`
     * (e.g. `{ type: 'beveled', radius: 20 }`).
     */
    link?: boolean | Partial<ComponentProps<typeof Link>>;

    /** Details (description, etc) useful to display in tooltip */
    details?: any;

    /** Classes for inner elements */
    props?: {
      label?: Partial<ComponentProps<typeof Text>>;
      circle?: Partial<ComponentProps<typeof Circle>>;
    };
  } & CommonStyleProps;

  export type AnnotationPointProps = AnnotationPointPropsWithoutHTML &
    Without<SVGAttributes<Element>, AnnotationPointPropsWithoutHTML>;
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import Circle from './Circle.svelte';
  import Link from './Link.svelte';
  import Text from './Text.svelte';
  import type { Placement } from './types.js';

  import { cls } from '@layerstack/tailwind';

  const {
    x,
    y,
    r = 4,
    label,
    labelPlacement = 'center',
    labelXOffset = 0,
    labelYOffset = 0,
    link,
    details,
    props,
  }: AnnotationPointProps = $props();

  const ctx = getChartContext();

  const point = $derived({
    x: x ? ctx.xScale(x) + (isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0) : 0,
    y: y ? ctx.yScale(y) + (isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0) : ctx.height,
  });

  const labelProps = $derived.by<ComponentProps<typeof Text>>(() => {
    // Unit vector from the ring center toward the placement direction — diagonals
    // land on the ring at 45°, not at the bounding-box corner.
    const dirX = labelPlacement.includes('left') ? -1 : labelPlacement.includes('right') ? 1 : 0;
    const dirY = labelPlacement.includes('top') ? -1 : labelPlacement.includes('bottom') ? 1 : 0;
    const mag = Math.hypot(dirX, dirY) || 1;
    const signX = labelPlacement.includes('left') ? -1 : 1;
    const signY = labelPlacement.includes('top') ? -1 : 1;

    return {
      x: point.x + (r * dirX) / mag + labelXOffset * signX,
      y: point.y + (r * dirY) / mag + labelYOffset * signY,
      dy: -2, // adjust for smaller font size
      textAnchor: labelPlacement.includes('left')
        ? 'end'
        : labelPlacement.includes('right')
          ? 'start'
          : 'middle',
      verticalAnchor: labelPlacement.includes('top')
        ? 'end'
        : labelPlacement.includes('bottom')
          ? 'start'
          : 'middle',
    };
  });

  // Endpoints for the optional leader `<Link>`. Source sits on the ring edge in
  // the direction dictated by `labelPlacement` — offsets don't rotate it.
  const linkEndpoints = $derived.by(() => {
    if (!link) return null;

    const dirX = labelPlacement.includes('left')
      ? -1
      : labelPlacement.includes('right')
        ? 1
        : 0;
    const dirY = labelPlacement.includes('top')
      ? -1
      : labelPlacement.includes('bottom')
        ? 1
        : 0;
    if (dirX === 0 && dirY === 0) return null; // labelPlacement='center' — no line

    const mag = Math.hypot(dirX, dirY);
    return {
      source: { x: point.x + (r * dirX) / mag, y: point.y + (r * dirY) / mag },
      target: { x: labelProps.x as number, y: labelProps.y as number },
    };
  });

  const linkProps = $derived(typeof link === 'object' ? link : {});

  function onPointerMove(e: PointerEvent | MouseEvent | TouchEvent) {
    if (details) {
      e.stopPropagation();
      ctx.tooltip.show(e, { annotation: { label, details } });
    }
  }

  function onPointerLeave(e: PointerEvent | MouseEvent | TouchEvent) {
    if (details) {
      e.stopPropagation();
      ctx.tooltip.hide();
    }
  }
</script>

<Circle
  cx={point.x}
  cy={point.y}
  {r}
  onpointermove={onPointerMove}
  onmousemove={onPointerMove}
  ontouchmove={onPointerMove}
  onpointerleave={onPointerLeave}
  onmouseleave={onPointerLeave}
  ontouchend={onPointerLeave}
  {...props?.circle}
  class={cls('lc-annotation-point', link && 'lc-annotation-point-ring', props?.circle?.class)}
/>

{#if linkEndpoints}
  <Link
    x1={linkEndpoints.source.x}
    y1={linkEndpoints.source.y}
    x2={linkEndpoints.target.x}
    y2={linkEndpoints.target.y}
    type="straight"
    {...linkProps}
    class={cls(
      'lc-annotation-point-link',
      typeof linkProps.class === 'string' ? linkProps.class : undefined
    )}
  />
{/if}

{#if label}
  <Text
    value={label}
    {...labelProps}
    {...props?.label}
    class={cls('lc-annotation-point-label', props?.label?.class)}
  />
{/if}

<style>
  @layer components {
    :global(:where(.lc-annotation-point-label)) {
      font-size: 12px;
      pointer-events: none;
    }

    :global(:where(.lc-annotation-point-ring)) {
      --fill-color: none;
      --stroke-color: var(--color-surface-content, currentColor);
    }

    :global(:where(.lc-annotation-point-link)) {
      --stroke-color: var(--color-surface-content, currentColor);
      fill: none;
      pointer-events: none;
    }
  }
</style>
