<script lang="ts">
  import { onDestroy } from 'svelte';

  import { geoContext } from './GeoContext.svelte';
  import Circle from './Circle.svelte';
  import Group from './Group.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { cls } from '@layerstack/tailwind';
  import { computedStyles } from '@layerstack/svelte-actions';

  /** Latitude */
  export let lat: number;
  /** Longitude */
  export let long: number;

  /** Render to canvas */
  export let render: (
    ctx: CanvasRenderingContext2D,
    coords: { x: number; y: number }
  ) => any = () => {};

  const geo = geoContext();

  $: [x, y] = $geo([long, lat]) ?? [0, 0];

  const canvasContext = getCanvasContext();
  const renderContext = canvasContext ? 'canvas' : 'svg';
  let _styles: CSSStyleDeclaration;

  function _render(ctx: CanvasRenderingContext2D) {
    render(ctx, { x, y });
  }

  $: if (renderContext === 'canvas') {
    canvasContext.register(_render);
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasContext.deregister(_render);
    }
  });
</script>

{#if renderContext === 'svg'}
  {#if $$slots.default}
    <Group {x} {y} {...$$restProps}>
      <slot />
    </Group>
  {:else}
    <Circle cx={x} cy={y} {...$$restProps} />
  {/if}
{/if}

<!-- Hidden div to copy computed styles -->
{#if renderContext === 'canvas'}
  {#if $$slots.default}
    <!-- <Group {x} {y} {...$$restProps}> -->
    <slot />
    <!-- </Group> -->
  {:else}
    <!-- <Circle cx={x} cy={y} {...$$restProps} /> -->
  {/if}

  <div
    class={cls('GeoPoint-classes hidden', $$props.class)}
    use:computedStyles={(styles) => (_styles = styles)}
  ></div>
{/if}
