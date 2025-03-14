<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { uniqueId } from '@layerstack/utils';
  import type { SVGAttributes } from 'svelte/elements';

  let {
    type,
    id = uniqueId('marker-'),
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
  }: {
    type?: 'arrow' | 'triangle' | 'line' | 'circle' | 'circle-stroke' | 'dot';
    id?: string;
    size?: number;
    markerWidth?: string | number;
    markerHeight?: string | number;
    markerUnits?: 'userSpaceOnUse' | 'strokeWidth';
    orient?: 'auto' | 'auto-start-reverse' | number;
    refX?: string | number;
    refY?: string | number;
    viewBox?: string;
  } & SVGAttributes<SVGMarkerElement> = $props();
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
      <path d="M 0 0 L 10 5 L 0 10 z" />
    {:else if type === 'arrow'}
      <polyline points="0 0, 10 5, 0 10" />
    {:else if type === 'circle' || type === 'circle-stroke' || type === 'dot'}
      <circle cx={5} cy={5} r={5} />
    {:else if type === 'line'}
      <polyline points="5 0, 5 10" />
    {/if}
  </marker>
</defs>
