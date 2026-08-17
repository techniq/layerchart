<script lang="ts" module>
  export type { BrushProps } from './Brush.base.svelte';
</script>

<script lang="ts">
  import BrushBase, { type BrushProps } from './Brush.base.svelte';
  import Rect from '../Rect/Rect.svg.svelte';

  let { state: stateProp = $bindable(), ...rest }: BrushProps = $props();
</script>

<BrushBase {Rect} bind:state={stateProp} {...rest} />
