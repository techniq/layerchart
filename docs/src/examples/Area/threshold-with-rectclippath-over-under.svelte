<script lang="ts">
	import { Area, Axis, Chart, Layer, RectClipPath, Rule } from 'layerchart';

	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: -20,
		max: 50,
		value: 'integer'
	});

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'quadtree-x' }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" />
			<Rule y={0} />
			<RectClipPath x={0} y={0} width={context.width} height={context.yScale(0)}>
				<Area line={{ class: 'stroke-2 stroke-success' }} class="fill-success/20" />
			</RectClipPath>
			<RectClipPath
				x={0}
				y={context.yScale(0)}
				width={context.width}
				height={context.height - context.yScale(0)}
			>
				<Area y0={(d) => 0} line={{ class: 'stroke-2 stroke-danger' }} class="fill-danger/20" />
			</RectClipPath>
		</Layer>
	{/snippet}
</Chart>
