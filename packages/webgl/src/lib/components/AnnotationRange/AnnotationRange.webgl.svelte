<script lang="ts">
  import type { AnnotationRangeProps } from 'layerchart';
  import { AnnotationRangeBase } from 'layerchart/base';
  import Rect from '../Rect/Rect.svelte';
  import Text from '../Text/Text.svelte';
  import LinearGradient from '../LinearGradient/LinearGradient.webgl.svelte';
  import Pattern from '../Pattern/Pattern.webgl.svelte';

  let props: AnnotationRangeProps = $props();
</script>

<!-- LayerChart's `AnnotationRange`, its `pattern` or `gradient` painted across its rect -->
<AnnotationRangeBase {LinearGradient} {Pattern} {Rect} {Text} {...props} />
