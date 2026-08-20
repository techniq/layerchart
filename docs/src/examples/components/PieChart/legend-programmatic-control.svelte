<script lang="ts">
	import { PieChart, type ChartState } from 'layerchart';
	import { Button, ButtonGroup } from 'svelte-ux';
	import { longData } from '$lib/utils/data';

	const data = longData.filter((d) => d.year === 2019);
	export { data };

	const slices = [
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'cherries', color: 'var(--color-cherries)' },
		{ key: 'grapes', color: 'var(--color-grapes)' }
	];

	let context = $state<ChartState>();
</script>

<div class="flex gap-1 mb-2 items-center flex-wrap">
	{#each slices as s (s.key)}
		{@const isVisible = context?.series.isVisible(s.key) ?? true}
		<!-- Always `outline` (with `--bg-color` set when visible) to keep the border, and thus size, stable -->
		<Button
			variant="outline"
			size="sm"
			rounded="full"
			style="--border-color: {s.color}; {isVisible
				? `--bg-color: ${s.color}; --text-color: white`
				: `--text-color: ${s.color}`}"
			onclick={() => context?.series.selectedKeys.toggle(s.key)}
			onpointerenter={() => {
				if (context && isVisible) context.series.highlightKey = s.key;
			}}
			onpointerleave={() => {
				if (context) context.series.highlightKey = null;
			}}
		>
			{s.key}
		</Button>
	{/each}

	<ButtonGroup variant="fill-light" size="sm" class="ml-auto">
		<Button onclick={() => context?.series.selectedKeys.clear()}>Show All</Button>
	</ButtonGroup>
</div>

<PieChart
	bind:context
	{data}
	key="fruit"
	value="value"
	cRange={slices.map((s) => s.color)}
	height={300}
/>
