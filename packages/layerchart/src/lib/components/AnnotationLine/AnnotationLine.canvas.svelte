<script lang="ts" module>
  export type {
    AnnotationLineProps,
    AnnotationLinePropsWithoutHTML,
  } from './AnnotationLine.shared.svelte.js';
</script>

<script lang="ts">
  import AnnotationLineBase from './AnnotationLine.base.svelte';
  import Line from '../Line/Line.canvas.svelte';
  import Text from '../Text/Text.canvas.svelte';
  import type { AnnotationLineProps } from './AnnotationLine.shared.svelte.js';

  let props: AnnotationLineProps = $props();
</script>

<AnnotationLineBase {Line} {Text} {...props} />
