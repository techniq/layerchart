<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
	import { Button, ButtonGroup } from 'svelte-ux';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});
	export { data };

	const series = [
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)', selected: false },
		{ key: 'oranges', color: 'var(--color-oranges)' }
	];

	let context: any = $state();
</script>

<div class="flex gap-2 mb-2 items-center flex-wrap">
	{#each series as s (s.key)}
		{@const isVisible = context?.series?.isVisible(s.key) ?? true}
		<button
			class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all"
			style:background-color={isVisible ? s.color : 'transparent'}
			style:color={isVisible ? 'white' : 'var(--color-surface-content)'}
			style:border="2px solid {s.color}"
			style:opacity={isVisible ? 1 : 0.4}
			onclick={() => context?.series?.selectedKeys?.toggle(s.key)}
		>
			{s.key}
		</button>
	{/each}

	<ButtonGroup variant="fill-light" size="sm" class="ml-auto">
		<Button onclick={() => context?.series?.selectedKeys?.clear()}>Show All</Button>
	</ButtonGroup>
</div>

<LineChart
	bind:context
	{data}
	x="date"
	{series}
	padding={defaultChartPadding({ right: 10 })}
	height={300}
/>
