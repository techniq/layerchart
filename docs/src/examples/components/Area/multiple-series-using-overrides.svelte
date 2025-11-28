<script lang="ts">
	import { Area, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';

	import { createDateSeries } from '$lib/utils/data.js';

	const keys = ['apples', 'bananas', 'oranges'];
	const multiSeriesData = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys
	});

	const fruitColors = {
		apples: 'var(--color-apples)',
		bananas: 'var(--color-bananas)',
		oranges: 'var(--color-oranges)'
	};

	export { multiSeriesData as data };
</script>

<Chart
	data={multiSeriesData}
	x="date"
	y={['apples', 'bananas', 'oranges']}
	yDomain={[0, null]}
	yNice
	padding={{ top: 20, left: 20, bottom: 20, right: 48 }}
	tooltip={{ mode: 'quadtree-x' }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />

		<Area
			y1={(d) => d.apples}
			class="stroke-2"
			fill={fruitColors.apples}
			fillOpacity={0.3}
			line={{ stroke: fruitColors.apples, class: 'stroke-2' }}
		/>

		<Area
			y1={(d) => d.bananas}
			class="stroke-2"
			fill={fruitColors.bananas}
			fillOpacity={0.3}
			line={{ stroke: fruitColors.bananas, class: 'stroke-2' }}
		/>

		<Area
			y1={(d) => d.oranges}
			class="stroke-2"
			fill={fruitColors.oranges}
			fillOpacity={0.3}
			line={{ stroke: fruitColors.oranges, class: 'stroke-2' }}
		/>

		<Highlight y={(d) => d.apples} points={{ fill: fruitColors.apples }} />
		<Highlight y={(d) => d.bananas} points={{ fill: fruitColors.bananas }} />
		<Highlight y={(d) => d.oranges} points={{ fill: fruitColors.oranges }} />
		<Highlight lines />
	</Layer>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="apples" value={data.apples} />
				<Tooltip.Item label="bananas" value={data.bananas} />
				<Tooltip.Item label="oranges" value={data.oranges} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
