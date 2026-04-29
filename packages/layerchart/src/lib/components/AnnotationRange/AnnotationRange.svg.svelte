<script lang="ts" module>
  export type {
    AnnotationRangeProps,
    AnnotationRangePropsWithoutHTML,
  } from './AnnotationRange.shared.svelte.js';
</script>

<script lang="ts">
  import AnnotationRangeBase from './AnnotationRange.base.svelte';
  import LinearGradient from '../LinearGradient/LinearGradient.svg.svelte';
  import Pattern from '../Pattern/Pattern.svg.svelte';
  import Rect from '../Rect/Rect.svg.svelte';
  import Text from '../Text/Text.svg.svelte';
  import type { AnnotationRangeProps } from './AnnotationRange.shared.svelte.js';

  let props: AnnotationRangeProps = $props();
</script>

<AnnotationRangeBase {LinearGradient} {Pattern} {Rect} {Text} {...props} />
