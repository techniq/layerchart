<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Pane, PaneGroup, PaneResizer } from 'paneforge';

	let { code, preview }: { code: Snippet; preview: Snippet } = $props();
</script>

<!--
	Editor left, preview right. The divider position is remembered (`autoSaveId`) across
	examples and reloads. The code scrolls inside its pane, capped to the viewport, so its
	toolbar sticks to the pane's top rather than under the header.

	Its own component so `Example` can load it (and paneforge) only when someone picks this
	layout, rather than on every page that shows an example.
-->
<PaneGroup
	direction="horizontal"
	autoSaveId="layerchart-example-split"
	class="border rounded-sm overflow-hidden"
>
	<Pane defaultSize={50} minSize={25} class="bg-surface-200 dark:bg-surface-300">
		<div class="h-full max-h-[80dvh] overflow-auto [--code-toolbar-top:0px]">
			{@render code()}
		</div>
	</Pane>
	<PaneResizer
		class="w-1 bg-surface-content/10 hover:bg-primary/40 data-[active]:bg-primary/60 transition-colors"
	/>
	<Pane defaultSize={50} minSize={25}>
		{@render preview()}
	</Pane>
</PaneGroup>
