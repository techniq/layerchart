<script lang="ts">
  import { getContext } from 'svelte';
  import type { Readable } from 'svelte/store';

  import { geoContext } from './GeoContext.svelte';
  import Circle from './Circle.svelte';
  import Group from './Group.svelte';

  /** Latitude */
  export let lat: number;
  /** Longitude */
  export let long: number;

  /** Render to canvas */
  export let render: (
    ctx: CanvasRenderingContext2D,
    coords: { x: number; y: number }
  ) => any = () => {};

  const canvas = getContext<{ ctx: Readable<CanvasRenderingContext2D> }>('canvas');
  const geo = geoContext();

  $: [x, y] = $geo([long, lat]) ?? [0, 0];

  $: renderContext = canvas ? 'canvas' : 'svg';

  $: ctx = canvas?.ctx;
  $: if (renderContext === 'canvas' && $ctx) {
    // $ctx.clearRect(0, 0, $width, $height);

    // Transfer classes defined on <GeoPoint> to <canvas> to enable window.getComputedStyle() retrieval (Tailwind classes, etc)
    if ($$props.class) {
      $ctx.canvas.classList.add(...$$props.class.split(' '));
    }

    render($ctx, { x, y });
  }
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
