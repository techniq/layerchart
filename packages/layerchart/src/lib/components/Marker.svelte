<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { uniqueId } from '@layerstack/utils';

  /** Defined the type of a default marker, or define your own in the slot */
  export let type: 'arrow' | 'triangle' | 'line' | 'circle' | 'circle-outline' | 'dot' | undefined =
    undefined;

  /** Unique id for marker */
  export let id: string = uniqueId('marker-');

  /** Width of stroke, although used to adjust size */
  export let strokeWidth = 1;

  /** A number used to determine the size of the bounding box the marker content. */
  export let size = 10;

  /** The width of the marker viewport */
  export let markerWidth: string | number = size;

  /** The height of the marker viewport */
  export let markerHeight: string | number = size;

  /** Set the coordinate system for the markerWidth, markerHeight, and `<marker>` contents  */
  export let markerUnits: 'userSpaceOnUse' | 'strokeWidth' = 'userSpaceOnUse';

  /** The orientation of the marker relative to the shape it is attached to */
  export let orient: 'auto' | 'auto-start-reverse' | number = 'auto-start-reverse';

  /** The x coordinate for the reference point of the marker */
  export let refX: string | number = ['arrow', 'triangle'].includes(type ?? '') ? 9 : 5;

  /** The y coordinate for the reference point of the maker */
  export let refY: string | number = 5;

  /** The bound of the SVG viewport for the current SVG fragment */
  export let viewBox = '0 0 10 10';
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
    _stroke-width={strokeWidth}
    class={cls(
      'overflow-visible',
      // stroke
      ['arrow', 'circle-outline', 'line'].includes(type ?? '')
        ? 'stroke-[context-stroke]'
        : type === 'circle'
          ? 'stroke-surface-100'
          : 'stroke-none',
      // extra stroke attrs
      '[stroke-linecap:round] [stroke-linejoin:round]',
      //fill
      ['triangle', 'dot', 'circle'].includes(type ?? '') ? 'fill-[context-stroke]' : 'fill-none'
    )}
    {...$$restProps}
  >
    <slot>
      {#if type === 'triangle'}
        <path d="M 0 0 L 10 5 L 0 10 z" />
      {:else if type === 'arrow'}
        <polyline points="0 0, 10 5, 0 10" />
      {:else if type === 'circle' || type === 'circle-outline' || type === 'dot'}
        <circle cx={5} cy={5} r={5} />
      {:else if type === 'line'}
        <polyline points="5 0, 5 10" />
      {/if}
    </slot>
  </marker>
</defs>
