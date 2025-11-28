<script lang="ts">
	import { scaleUtc } from 'd3-scale';
	import { flatGroup } from 'd3-array';
	import { curveCatmullRom } from 'd3-shape';
	import { cls } from '@layerstack/tailwind';
	import { Axis, Chart, Layer, Spline } from 'layerchart';
	import { getDailyTemperatures } from '$lib/data.remote';

	const data = await getDailyTemperatures();

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleUtc()}
	y="value"
	yRange={({ height }) => [height / 5, height / 2]}
	yPadding={[0, 20]}
	zDomain={[1940, 2024]}
	zRange={[0.1, 0.2]}
	radial
	padding={{ top: 12, bottom: 12 }}
	height={500}
>
	{#snippet children({ context })}
		<Layer center>
			{#each flatGroup(data, (d) => d.year) as [year, yearData]}
				<Spline
					data={yearData}
					curve={curveCatmullRom}
					class={cls(
						year === 2024
							? 'stroke-primary'
							: year === 2023
								? 'stroke-primary/50'
								: 'stroke-surface-content'
					)}
					opacity={[2023, 2024].includes(year) ? 1 : context.zScale(year)}
				/>
			{/each}
			<Axis placement="angle" tickLength={0} grid format={'month'} />
			<Axis
				placement="radius"
				grid
				rule={{ y: '$top', class: 'stroke-surface-content/20' }}
				ticks={4}
				format={(v) => v + '° F'}
			/>
		</Layer>
	{/snippet}
</Chart>
