<script lang="ts" module>
  export type {
    AnnotationLineProps,
    AnnotationLinePropsWithoutHTML,
  } from './AnnotationLine.shared.svelte.js';
</script>

<script lang="ts">
  import AnnotationLineBase from './AnnotationLine.base.svelte';
  import Line from '../Line/Line.svg.svelte';
  import Text from '../Text/Text.svg.svelte';
  import type { AnnotationLineProps } from './AnnotationLine.shared.svelte.js';

  let props: AnnotationLineProps = $props();
</script>

<AnnotationLineBase {Line} {Text} {...props} />
