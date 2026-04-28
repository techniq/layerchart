<script lang="ts" module>
  export type { HighlightProps, HighlightPropsWithoutHTML, HighlightPoint, HighlightPointData } from './Highlight.shared.svelte.js';
</script>

<script lang="ts">
  import HighlightBase from './Highlight.base.svelte';
  import Circle from '../Circle/Circle.svg.svelte';
  import Line from '../Line/Line.svg.svelte';
  import Rect from '../Rect/Rect.svg.svelte';
  import Arc from '../Arc/Arc.svg.svelte';

  import type { HighlightProps } from './Highlight.shared.svelte.js';

  let props: HighlightProps = $props();
</script>

<HighlightBase {Circle} {Line} {Rect} {Arc} {...props} />
