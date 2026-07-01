<script module lang="ts">
	import { getWind } from '$lib/geo.remote.js';
	const windData = await getWind();
</script>

<script lang="ts">
	import { max } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';

	import { Axis, Chart, Layer, Vector, Tooltip } from 'layerchart';

	const wind = windData.map((d) => {
		const speed = Math.hypot(d.u, d.v);
		const angle = (Math.atan2(d.u, d.v) * 180) / Math.PI;
		return { ...d, speed, angle };
	});

	const colorScale = scaleSequential(interpolateTurbo).domain([0, max(wind, (d) => d.speed)!]);

	const data = { wind: windData };

	export { data };
</script>

<Chart
	data={wind}
	x="longitude"
	y="latitude"
	r="speed"
	rRange={[0, 20]}
	padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
	tooltipContext={{ mode: 'quadtree' }}
	height={500}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="bottom" />
			<Axis placement="left" />

			<Vector
				x="longitude"
				y="latitude"
				length="speed"
				rotate="angle"
				anchor="middle"
				stroke={(d) => colorScale(d.speed)}
				strokeWidth={1}
			/>
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>Wind</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Speed (m/s)" value={data.speed} format="decimal" />
					<Tooltip.Item label="Direction" value={data.angle} format="decimal" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
