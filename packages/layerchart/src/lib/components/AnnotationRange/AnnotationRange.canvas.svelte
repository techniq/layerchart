<script lang="ts" module>
  export type {
    AnnotationRangeProps,
    AnnotationRangePropsWithoutHTML,
  } from './AnnotationRange.shared.svelte.js';
</script>

<script lang="ts">
  import AnnotationRangeBase from './AnnotationRange.base.svelte';
  import LinearGradient from '../LinearGradient/LinearGradient.canvas.svelte';
  import Pattern from '../Pattern/Pattern.canvas.svelte';
  import Rect from '../Rect/Rect.canvas.svelte';
  import Text from '../Text/Text.canvas.svelte';
  import type { AnnotationRangeProps } from './AnnotationRange.shared.svelte.js';

  let props: AnnotationRangeProps = $props();
</script>

<AnnotationRangeBase {LinearGradient} {Pattern} {Rect} {Text} {...props} />
