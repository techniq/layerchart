<script lang="ts">
  import { uniqueId } from '@layerstack/utils';

  /** Unique id for linearGradient */
  export let id: string = uniqueId('radialGradient-');

  /** Array array of strings (colors), will equally distributed from 0-100%.  If array of tuples, will use first value as the offset, and second as color */
  export let stops: string[] | [string | number, string][] = [
    'var(--tw-gradient-from)',
    'var(--tw-gradient-to)',
  ];

  export let cx = '50%';
  export let cy = '50%';
  export let fx = cx;
  export let fy = cy;
  export let r = '50%';
  // TODO: Svelte / Typescript does not know `<radialRadiant fr="...">`
  // export let fr = '0%';

  /** Indicates how the gradient behaves if it starts or ends inside the bounds of the shape containing the gradient */
  export let spreadMethod: 'pad' | 'reflect' | 'repeat' = 'pad';

  export let transform: string | null | undefined = undefined;

  /** Define the coordinate system for attributes (i.e. gradientUnits) */
  export let units: 'objectBoundingBox' | 'userSpaceOnUse' = 'objectBoundingBox';
</script>

<defs>
  <radialGradient
    {id}
    {cx}
    {cy}
    {fx}
    {fy}
    {r}
    {spreadMethod}
    gradientTransform={transform}
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
  </radialGradient>
</defs>

<slot {id} gradient="url(#{id})" />
