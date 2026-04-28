<script lang="ts" module>
  export type { HighlightProps, HighlightPropsWithoutHTML, HighlightPoint, HighlightPointData } from './Highlight.shared.svelte.js';
</script>

<script lang="ts">
  import HighlightBase from './Highlight.base.svelte';
  import Circle from '../Circle/Circle.html.svelte';
  import Line from '../Line/Line.html.svelte';
  import Rect from '../Rect/Rect.html.svelte';
  // Arc has no html variant — radial highlight area uses SVG path. Highlight.html
  // never enters the radial branch (no html chart context is radial), but we
  // import Arc.svg here so the per-layer wrapper avoids the agnostic dispatcher.
  import Arc from '../Arc/Arc.svg.svelte';

  import type { HighlightProps } from './Highlight.shared.svelte.js';

  let props: HighlightProps = $props();
</script>

<HighlightBase {Circle} {Line} {Rect} {Arc} {...props} />
