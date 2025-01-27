<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { uniqueId } from '@layerstack/utils';

  import ClipPath from './ClipPath.svelte';
  import Rect from './Rect.svelte';

  /** Unique id for clipPath */
  export let id: string = uniqueId('clipPath-');

  export let x: number = 0;
  export let y: number = 0;
  export let width: number;
  export let height: number;
  export let spring: ComponentProps<Rect>['spring'] = undefined;
  export let tweened: ComponentProps<Rect>['tweened'] = undefined;

  /** Disable clipping (show all) */
  export let disabled: boolean = false;
</script>

<ClipPath {id} {disabled} let:url>
  <Rect slot="clip" {x} {y} {width} {height} {spring} {tweened} {...$$restProps} />
  <slot {id} {url} />
</ClipPath>
