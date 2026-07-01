<script lang="ts" module>
  export type {
    RadialGradientProps,
    RadialGradientPropsWithoutHTML,
  } from './RadialGradient.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { createId } from '$lib/utils/createId.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import type { RadialGradientProps } from './RadialGradient.shared.svelte.js';

  const uid = $props.id();

  let {
    id = createId('radialGradient-', uid),
    stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
    cx = '50%',
    cy = '50%',
    fx = cx,
    fy = cy,
    r = '50%',
    spreadMethod = 'pad',
    transform = undefined,
    units = 'objectBoundingBox',
    children,
    stopsContent,
    class: className,
    ...rest
  }: RadialGradientProps = $props();
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
    {...extractLayerProps({ ...rest, class: className }, 'lc-radial-gradient')}
  >
    {#if stopsContent}
      {@render stopsContent()}
    {:else if stops}
      {@const stopClass = cls('lc-radial-gradient-stop', className)}
      {#each stops as stop, i}
        {#if Array.isArray(stop)}
          <stop offset={stop[0]} stop-color={stop[1]} class={stopClass} />
        {:else}
          <stop
            offset="{i * (100 / (stops.length - 1))}%"
            stop-color={stop}
            class={stopClass}
          />
        {/if}
      {/each}
    {/if}
  </radialGradient>
</defs>

{@render children?.({ id, gradient: `url(#${id})` })}
