<script lang="ts">
	import LiveExample from '$lib/sandbox/LiveExample.svelte';

	// The real example components — rendered as-is until the user clicks into the code,
	// so an unedited page never loads the compiler.
	import SeriesStack from '$examples/components/AreaChart/series-stack.svelte';
	import LineBasic from '$examples/components/LineChart/basic.svelte';

	// ...and their sources, which is what the editor starts from.
	import seriesStackSource from '$examples/components/AreaChart/series-stack.svelte?raw';
	import lineBasicSource from '$examples/components/LineChart/basic.svelte?raw';
</script>

<div class="grid gap-6 p-4">
	<div>
		<h1 class="text-xl font-semibold">Sandbox proof of concept</h1>
		<p class="text-sm text-surface-content/70">
			The chart on the right is the real example component. Click into the code and it's replaced by
			an in-page compile of whatever you type — the compiler and editor load on that first click.
		</p>
	</div>

	<section class="grid gap-2">
		<h2 class="font-medium">AreaChart / series-stack</h2>
		<LiveExample source={seriesStackSource} class="h-[420px]">
			{#snippet preview()}
				<SeriesStack />
			{/snippet}
		</LiveExample>
	</section>

	<section class="grid gap-2">
		<h2 class="font-medium">LineChart / basic</h2>
		<LiveExample source={lineBasicSource} class="h-[420px]">
			{#snippet preview()}
				<LineBasic />
			{/snippet}
		</LiveExample>
	</section>
</div>
