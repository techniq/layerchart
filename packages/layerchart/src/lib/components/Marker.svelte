<script lang="ts" module>
  import type { Without } from 'layerchart/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  export type MarkerPropsWithoutHTML = {
    /**
     * The type of marker to render (e.g., arrow, triangle, etc.)
     *
     * Pass `children` to render a custom element/component inside the marker instead.
     */
    type?: 'arrow' | 'triangle' | 'line' | 'circle' | 'circle-stroke' | 'dot';

    /**
     * Unique identifier for the marker
     */
    id?: string;

    /**
     * Size of the marker
     * (used as default for width and height if not overridden)
     * @default 10
     */
    size?: number;

    /**
     * Width of the marker (can be a string or number)
     * @default size
     */
    markerWidth?: string | number;

    /**
     * Height of the marker (can be a string or number)
     * @default size
     */
    markerHeight?: string | number;

    /**
     * Units for marker dimensions ('userSpaceOnUse' or 'strokeWidth')
     * @default 'userSpaceOnUse'
     */
    markerUnits?: 'userSpaceOnUse' | 'strokeWidth';

    /**
     * Orientation of the marker
     * ('auto', 'auto-start-reverse', or a specific angle in degrees)
     * @default 'auto-start-reverse'
     */
    orient?: 'auto' | 'auto-start-reverse' | number;

    /**
     * X-coordinate offset of the marker's reference point
     * @default 9 if type is 'arrow' or 'triangle', otherwise 5
     */
    refX?: string | number;

    /**
     * Y-coordinate offset of the marker's reference point
     * @default 5
     */
    refY?: string | number;

    /**
     * Viewbox defining the coordinate system for the marker (e.g., '0 0 10 10')
     * @default '0 0 10 10'
     */
    viewBox?: string;
  };

  export type MarkerProps = MarkerPropsWithoutHTML &
    Without<SVGAttributes<SVGMarkerElement>, MarkerPropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { createId } from 'layerchart/utils/createId.js';
  import { createDataAttr } from 'layerchart/utils/attributes.js';

  const uid = $props.id();

  let {
    type,
    id = createId('marker-', uid),
    size = 10,
    markerWidth = size,
    markerHeight = size,
    markerUnits = 'userSpaceOnUse',
    orient = 'auto-start-reverse',
    refX = ['arrow', 'triangle'].includes(type ?? '') ? 9 : 5,
    refY = 5,
    viewBox = '0 0 10 10',
    class: className,
    children,
    ...restProps
  }: MarkerProps = $props();
</script>

<defs>
  <marker
    {id}
    {markerWidth}
    {markerHeight}
    {markerUnits}
    {orient}
    {refX}
    {refY}
    {viewBox}
    {...restProps}
    {...createDataAttr('marker')}
    class={cls(
      'overflow-visible',
      // stroke
      restProps.stroke == null &&
        (['arrow', 'circle-stroke', 'line'].includes(type ?? '')
          ? 'stroke-[context-stroke]'
          : type === 'circle'
            ? 'stroke-surface-100'
            : 'stroke-none'),
      // extra stroke attrs
      '[stroke-linecap:round] [stroke-linejoin:round]',
      //fill
      restProps.fill == null &&
        (['triangle', 'dot', 'circle'].includes(type ?? '')
          ? 'fill-[context-stroke]'
          : type === 'circle-stroke'
            ? 'fill-surface-100'
            : 'fill-none'),
      className
    )}
  >
    {#if children}
      {@render children()}
    {:else if type === 'triangle'}
      <path d="M 0 0 L 10 5 L 0 10 z" {...createDataAttr('marker-triangle')} />
    {:else if type === 'arrow'}
      <polyline points="0 0, 10 5, 0 10" {...createDataAttr('marker-arrow')} />
    {:else if type === 'circle' || type === 'circle-stroke' || type === 'dot'}
      <circle cx={5} cy={5} r={5} {...createDataAttr('marker-circle')} />
    {:else if type === 'line'}
      <polyline points="5 0, 5 10" {...createDataAttr('marker-line')} />
    {/if}
  </marker>
</defs>
