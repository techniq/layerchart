<script lang="ts">
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

  import { uniqueId } from 'svelte-ux';

  import ClipPath from './ClipPath.svelte';
  import Rect from './Rect.svelte';

  /** Unique id for clipPath */
  export let id: string = uniqueId('clipPath-');

  export let x: number = 0;
  export let y: number = 0;
  export let width: number;
  export let height: number;
  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;
</script>

<ClipPath {id}>
  <Rect {x} {y} {width} {height} {spring} {tweened} />
</ClipPath>

{#if $$slots.default}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <g style="clip-path: url(#{id})" on:click on:mousemove on:mouseleave>
    <slot {id} />
  </g>
{/if}
