<script lang="ts">
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

  import { uniqueId } from 'svelte-ux';

  import ClipPath from './ClipPath.svelte';
  import Circle from './Circle.svelte';

  /** Unique id for clipPath */
  export let id: string = uniqueId('clipPath-');

  export let cx: number = 0;
  export let cy: number = 0;
  export let r: number;
  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;
</script>

<ClipPath {id}>
  <Circle slot="clip" {cx} {cy} {r} {spring} {tweened} />
  <slot {id} />
</ClipPath>
