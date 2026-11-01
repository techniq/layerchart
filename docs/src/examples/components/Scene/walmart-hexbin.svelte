<script module lang="ts">
	import { getUsStatesTopology, getWalmarts } from '$lib/geo.remote.js';
	const walmarts = await getWalmarts();
	const topology = await getUsStatesTopology();
</script>

<script lang="ts">
	import { extent } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateYlGnBu } from 'd3-scale-chromatic';
	import { geoAlbersUsa } from 'd3-geo';
	import { feature, mesh } from 'topojson-client';
	import { Chart, GeoPath, Polygon, Scene, Tooltip, type ChartState } from '@layerchart/3d';

	const states = feature(topology, topology.objects.states);
	const nation = feature(topology, topology.objects.nation);
	const statemesh = mesh(topology, topology.objects.states, (a, b) => a !== b);

	export { walmarts as data };

	const RADIUS = 10;

	/** Stores binned into pointy-topped hexagons `RADIUS` pixels across their corners */
	function hexbin(context: ChartState<any>) {
		const projection = context.geo.projection;
		if (!projection) return [];
		const dx = RADIUS * 2 * Math.sin(Math.PI / 3);
		const dy = RADIUS * 1.5;
		const bins: Record<string, { x: number; y: number; count: number }> = {};
		for (const d of walmarts) {
			const p = projection([d.longitude, d.latitude]);
			if (!p) continue;
			const [px, py] = p;
			let pj = Math.round(py / dy);
			let pi = Math.round(px / dx - (pj & 1) / 2);
			const py1 = py / dy - pj;
			if (Math.abs(py1) * 3 > 1) {
				const px1 = px / dx - (pj & 1) / 2 - pi;
				const pi2 = pi + (px / dx - (pj & 1) / 2 < pi ? -1 : 1) / 2;
				const pj2 = pj + (py / dy < pj ? -1 : 1);
				const px2 = px / dx - pi2;
				const py2 = py / dy - pj2;
				if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) {
					pi = pi2 + (pj & 1 ? 1 : -1) / 2;
					pj = pj2;
				}
			}
			const key = `${pi},${pj}`;
			const bin = (bins[key] ??= { x: (pi + (pj & 1) / 2) * dx, y: pj * dy, count: 0 });
			bin.count += 1;
		}
		return Object.values(bins);
	}

	const hexagon = (bin: { x: number; y: number }) =>
		Array.from({ length: 6 }, (_, i): [number, number] => {
			const a = (i * Math.PI) / 3;
			return [bin.x + RADIUS * Math.sin(a), bin.y - RADIUS * Math.cos(a)];
		});
</script>

<!-- Each hexagon raised by its number of stores -->
<Chart
	data={walmarts}
	x="longitude"
	y="latitude"
	geo={{ projection: geoAlbersUsa, fitGeojson: states }}
	zDomain={[0, 1]}
	zRange={({ height }) => [0, height * 0.25]}
	tooltipContext
	height={550}
	class="cursor-grab active:cursor-grabbing"
>
	{#snippet children({ context })}
		{@const bins = hexbin(context)}
		{@const [fewest, most] = (extent(bins, (b) => b.count) as [number, number]) ?? [0, 1]}
		<!-- Colored by count as `Bin` colors its cells: yellow-green-blue over the counts' range -->
		{@const color = scaleSequential([fewest, most], interpolateYlGnBu)}
		<Scene rotate={25} tilt={50} scrollActivationKey="shift">
			<GeoPath
				geojson={nation}
				fill="color-mix(in oklab, var(--color-surface-content) 5%, var(--color-surface-100))"
				stroke="color-mix(in oklab, var(--color-surface-content) 30%, var(--color-surface-100))"
			/>
			<GeoPath
				geojson={statemesh}
				stroke="color-mix(in oklab, var(--color-surface-content) 20%, var(--color-surface-100))"
			/>
			<Polygon
				tooltip
				data={bins}
				points={hexagon}
				z={(bin) => bin.count / most}
				fill={(bin) => color(bin.count)}
			/>
		</Scene>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.List>
					<Tooltip.Item label="stores" value={data.count} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
