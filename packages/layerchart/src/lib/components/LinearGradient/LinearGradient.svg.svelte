<script lang="ts" module>
  export type {
    LinearGradientProps,
    LinearGradientPropsWithoutHTML,
  } from './LinearGradient.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { createId } from '$lib/utils/createId.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import type { LinearGradientProps } from './LinearGradient.shared.svelte.js';

  const uid = $props.id();

  let {
    id = createId('linearGradient-', uid),
    stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
    vertical = false,
    x1 = '0%',
    y1 = '0%',
    x2 = vertical ? '0%' : '100%',
    y2 = vertical ? '100%' : '0%',
    rotate,
    units = 'objectBoundingBox',
    ref: refProp = $bindable(),
    class: className,
    stopsContent,
    children,
    ...rest
  }: LinearGradientProps = $props();

  let ref = $state<SVGLinearGradientElement>();
  $effect.pre(() => {
    refProp = ref;
  });
</script>

<defs>
  <linearGradient
    bind:this={ref}
    {id}
    {x1}
    {y1}
    {x2}
    {y2}
    gradientTransform={rotate ? `rotate(${rotate})` : ''}
    gradientUnits={units}
    {...extractLayerProps(rest, 'lc-linear-gradient')}
  >
    {#if stopsContent}
      {@render stopsContent?.()}
    {:else if stops}
      {#each stops as stop, i}
        {#if Array.isArray(stop)}
          <stop
            offset={stop[0]}
            stop-color={stop[1]}
            class={cls('lc-linear-gradient-stop', className)}
          />
        {:else}
          <stop
            offset="{i * (100 / (stops.length - 1))}%"
            stop-color={stop}
            class={cls('lc-linear-gradient-stop', className)}
          />
        {/if}
      {/each}
    {/if}
  </linearGradient>
</defs>

{@render children?.({ id, gradient: `url(#${id})` })}
