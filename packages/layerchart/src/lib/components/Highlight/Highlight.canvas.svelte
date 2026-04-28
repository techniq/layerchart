<script lang="ts" module>
  export type { HighlightProps, HighlightPropsWithoutHTML, HighlightPoint, HighlightPointData } from './Highlight.shared.svelte.js';
</script>

<script lang="ts">
  import HighlightBase from './Highlight.base.svelte';
  import Circle from '../Circle/Circle.canvas.svelte';
  import Line from '../Line/Line.canvas.svelte';
  import Rect from '../Rect/Rect.canvas.svelte';
  // Arc is not split yet — uses agnostic dispatcher.
  import Arc from '../Arc.svelte';

  import type { HighlightProps } from './Highlight.shared.svelte.js';

  let props: HighlightProps = $props();
</script>

<HighlightBase {Circle} {Line} {Rect} {Arc} {...props} />
