<script lang="ts">
	import { accessor, Area, AreaChart, LinearGradient, Text } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { curveBasis } from 'd3-shape';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };

	const funnelSegments = [
		{ index: 0, value: 100 },
		{ index: 1, value: 50 },
		{ index: 2, value: 25 },
		{ index: 3, value: 10 },
		{ index: 4, value: 2.5 }
	];

	function interpolateData(data: any[], options: { x: string; y: string }) {
		const x = accessor(options.x);
		const y = accessor(options.y);

		return data.flatMap((current, i, arr) => {
			if (i === arr.length - 1) {
				return current;
			}
			const next = arr[i + 1];

			const xStep = 0.25;
			const yStep = Math.abs(y(next) - y(current)) * 0.03;

			const xMid1 = Math.abs(x(current) + xStep);
			const yMid1 = Math.abs(y(current) - yStep);
			const xMid2 = Math.abs(x(next) - xStep);
			const yMid2 = Math.abs(y(next) + yStep);

			return [
				current,
				{ [options.x]: xMid1, [options.y]: yMid1 },
				{ [options.x]: xMid2, [options.y]: yMid2 }
			];
		});
	}
</script>

<AreaChart
	data={interpolateData(funnelSegments, { x: 'index', y: 'value' })}
	x="index"
	y={[(d) => d.value, (d) => -d.value]}
	axis={false}
	yPadding={[20, 20]}
	props={{
		grid: {
			x: { class: 'stroke-2 stroke-surface-content/20' },
			y: false,
			xTicks: funnelSegments.map((d) => d.index)
		}
	}}
	tooltip={false}
	height={400}
>
	{#snippet marks({ context })}
		{@const segmentWidth = context.width / (funnelSegments.length - 1)}
		{@const areas = [
			{ padding: 0, opacity: 1 },
			{ padding: 10, opacity: 0.2 },
			{ padding: 20, opacity: 0.1 }
		]}

		<LinearGradient class="from-primary/50 to-secondary/10">
			{#snippet children({ gradient })}
				{#each areas as a}
					<Area
						y0={(d) => d.value + a.padding}
						y1={(d) => -(d.value + a.padding)}
						fill={gradient}
						curve={curveBasis}
					/>
				{/each}
			{/snippet}
		</LinearGradient>

		{#each funnelSegments.slice(0, -1) as s}
			<Text
				value={s.value + '%'}
				x={context.xScale(context.x(s)) + segmentWidth / 2}
				y={context.height / 2}
				textAnchor="middle"
				verticalAnchor="middle"
				class="text-2xl fill-current opacity-70"
				dy={3}
			/>
		{/each}
	{/snippet}
</AreaChart>
