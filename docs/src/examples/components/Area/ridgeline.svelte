<script lang="ts">
	import { Area, Axis, Chart, Group, Layer, Text } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import { curveBasis } from 'd3-shape';
	import { max } from 'd3-array';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import { createDateSeries } from '$lib/utils/data.js';

	let overlap = $state(2);
	let height = $state(400);
	let opaque = $state(false);

	const N = 10; // number of categories
	const basePadding = { top: 20, bottom: 30, left: 80, right: 10 };

	// Solve for top padding that fits the tallest peaks:
	// peaks extend (overlap-1)*step above the first row, and step depends on innerHeight
	const overlapExtra = $derived(Math.max(0, overlap - 1));
	const paddingTop = $derived(
		(N * basePadding.top + overlapExtra * (height - basePadding.bottom)) / (N + overlapExtra)
	);
	const padding = $derived({
		...basePadding,
		top: paddingTop
	});

	const categories = [
		'Series A',
		'Series B',
		'Series C',
		'Series D',
		'Series E',
		'Series F',
		'Series G',
		'Series H',
		'Series I',
		'Series J'
	];

	const seriesData = categories.map((name) => ({
		name,
		values: createDateSeries({ count: 40, min: 0, max: 100, value: 'integer' })
	}));

	const maxValue = max(seriesData.flatMap((s) => s.values.map((d) => d.value))) ?? 100;

	// Inner chart height (total minus padding) used to make yScale an identity
	const innerHeight = $derived(height - paddingTop - basePadding.bottom);
	const step = $derived(innerHeight / N);

	// Value scale converts data values to pixel offsets within each row (negative = upward)
	const zScale = $derived(
		scaleLinear()
			.domain([0, maxValue])
			.range([0, -overlap * step])
	);

	export { seriesData as data };
</script>

<div class="flex gap-4 mb-4">
	<RangeField label="Overlap" bind:value={overlap} min={1} max={12} step={0.5} />
	<RangeField label="Height" bind:value={height} min={200} max={600} step={50} />
	<Field label="Opaque" let:id>
		<Switch {id} bind:checked={opaque} size="md" />
	</Field>
</div>

<Chart
	data={seriesData[0].values}
	x="date"
	y="value"
	yDomain={[0, innerHeight]}
	yRange={({ height }) => [0, height]}
	{padding}
	{height}
>
	<Layer>
		{#each seriesData as series, i (series.name)}
			{@const rowY = step + i * step}
			<Group y={rowY}>
				<Area
					data={series.values}
					y0={() => 0}
					y1={(d) => zScale(d.value)}
					curve={curveBasis}
					class={opaque ? 'fill-primary-200 dark:fill-primary-900' : 'fill-primary/20'}
					line={{ class: 'stroke-primary stroke-1' }}
				/>
			</Group>
		{/each}

		{#each categories as name, i}
			{@const rowY = step + i * step}
			<Text
				value={name}
				x={-8}
				y={rowY}
				textAnchor="end"
				verticalAnchor="middle"
				class="text-xs fill-surface-content/60"
			/>
		{/each}

		<Axis placement="bottom" rule />
	</Layer>
</Chart>
