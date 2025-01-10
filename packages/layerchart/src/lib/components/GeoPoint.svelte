<script lang="ts">
  import { onDestroy } from 'svelte';

  import { geoContext } from './GeoContext.svelte';
  import Circle from './Circle.svelte';
  import Group from './Group.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';

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

  function _render(ctx: CanvasRenderingContext2D) {
    render(ctx, { x, y });
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({ name: 'GeoPoint', render: _render });
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasUnregister();
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

{#if renderContext === 'canvas'}
  {#if $$slots.default}
    <!-- TODO: Handle Canvas translation.  Conslidate with svg use case above (if `render` is not defined) -->
    <!-- <Group {x} {y} {...$$restProps}> -->
    <slot />
    <!-- </Group> -->
  {:else}
    <Circle cx={x} cy={y} {...$$restProps} />
  {/if}
{/if}
