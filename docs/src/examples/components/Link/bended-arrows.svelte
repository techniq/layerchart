<script module lang="ts">
	import { getMetros } from '$lib/data.remote';
	const data = await getMetros();
</script>

<script lang="ts">
	import { scaleDiverging, scaleLog } from 'd3-scale';
	import { interpolateRdBu } from 'd3-scale-chromatic';
	import { format } from '@layerstack/utils';
	import { Axis, Chart, Layer, Legend, Link, Text } from 'layerchart';

	// Inequality change from 1980 → 2015 — positive means more unequal.
	// Reverse RdBu so red = increased inequality, blue = decreased.
	const colorScale = scaleDiverging([-4, 0, 4], (t: number) => interpolateRdBu(1 - t));

	const highlighted = data.filter((d) => d.highlight === 1);

	export { data };
</script>

<div class="flex justify-end mb-2">
	<Legend
		scale={colorScale}
		title="Change in inequality from 1980 to 2015"
		tickFormat={(v) => (v > 0 ? `+${v}` : `${v}`)}
		class="max-w-sm"
	/>
</div>

<Chart
	{data}
	x={['POP_1980', 'POP_2015']}
	y={['R90_10_1980', 'R90_10_2015']}
	xScale={scaleLog()}
	c={(d) => d.R90_10_2015 - d.R90_10_1980}
	cScale={colorScale}
	cDomain={[-4, 0, 4]}
	xPadding={[10, 30]}
	yPadding={[10, 20]}
	padding={{ top: 20, right: 20, bottom: 32, left: 40 }}
	tooltipContext={{ mode: 'quadtree', x: 'POP_2015', y: 'R90_10_2015' }}
	height={500}
>
	{#snippet children({ context })}
		<Layer>
			<Axis
				placement="bottom"
				grid
				label="Population"
				format={(v) => {
					const mag = Math.pow(10, Math.floor(Math.log10(v)));
					return v / mag <= 4 ? format(v, 'metric') : '';
				}}
			/>
			<Axis placement="left" grid label="Inequality (90/10 ratio)" />

			<Link
				x1="POP_1980"
				y1="R90_10_1980"
				x2="POP_2015"
				y2="R90_10_2015"
				type="swoop"
				bend={22.5}
				markerEnd="arrow"
				strokeWidth={1.5}
				class={(d) =>
					context.tooltip.data == null
						? ''
						: context.tooltip.data.Metro === d.Metro
							? 'stroke-2'
							: 'opacity-10'}
			/>

			<Text
				data={context.tooltip.data ? [context.tooltip.data] : highlighted}
				x="POP_2015"
				y="R90_10_2015"
				value="nyt_display"
				textAnchor="middle"
				dy={-6}
				class="text-xs text-current stroke-2 stroke-surface-100 font-semibold pointer-events-none"
			/>
		</Layer>
	{/snippet}
</Chart>
