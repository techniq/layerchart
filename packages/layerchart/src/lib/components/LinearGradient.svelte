<script lang="ts">
  import { uniqueId } from '@layerstack/utils';

  /** Unique id for linearGradient */
  export let id: string = uniqueId('linearGradient-');

  /** Array array of strings (colors), will equally distributed from 0-100%.  If array of tuples, will use first value as the offset, and second as color */
  export let stops: string[] | [string | number, string][] = [
    'var(--tw-gradient-from)',
    'var(--tw-gradient-to)',
  ];

  /** Apply color stops top-to-bottom (true) or left-to-right (false) */
  export let vertical = false;
  export let x1 = '0%';
  export let y1 = '0%';
  export let x2 = vertical ? '0%' : '100%';
  export let y2 = vertical ? '100%' : '0%';

  export let rotate: number | undefined = undefined;

  /** Define the coordinate system for attributes (i.e. gradientUnits) */
  export let units: 'objectBoundingBox' | 'userSpaceOnUse' = 'objectBoundingBox';
</script>

<defs>
  <linearGradient
    {id}
    {x1}
    {y1}
    {x2}
    {y2}
    gradientTransform={rotate ? `rotate(${rotate})` : ''}
    gradientUnits={units}
    {...$$restProps}
  >
    <slot name="stops">
      {#if stops}
        {#each stops as stop, i}
          {#if Array.isArray(stop)}
            <stop offset={stop[0]} stop-color={stop[1]} />
          {:else}
            <stop offset="{i * (100 / (stops.length - 1))}%" stop-color={stop} />
          {/if}
        {/each}
      {/if}
    </slot>
  </linearGradient>
</defs>

<slot {id} url="url(#{id})" />
