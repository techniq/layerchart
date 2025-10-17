<script lang="ts">
	import { createDateSeries } from '$lib/utils/data';
	import { Axis, Bars, Chart, Highlight, Svg, Tooltip } from 'layerchart';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	yNice
	height={300}
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'band' }}
>
	{#snippet children({ context })}
		<Svg>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Bars strokeWidth={1} class="fill-primary group-hover:fill-gray-300 transition-colors" />
			<Highlight area bar={{ class: 'fill-primary', strokeWidth: 1 }} />
		</Svg>
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
