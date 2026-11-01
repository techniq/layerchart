<script module lang="ts">
	import { getOlympians } from '$lib/data.remote.js';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { extent } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateYlGnBu } from 'd3-scale-chromatic';
	import { Axis, Chart, Grid, Polygon, Scene, Tooltip, type ChartState } from '@layerchart/3d';

	const data = olympians.filter((d) => d.weight != null && d.height != null);
	export { data };

	const RADIUS = 12;

	/** Points binned into pointy-topped hexagons `RADIUS` pixels across their corners */
	function hexbin(context: ChartState<any>) {
		const dx = RADIUS * 2 * Math.sin(Math.PI / 3);
		const dy = RADIUS * 1.5;
		const bins: Record<string, { x: number; y: number; count: number }> = {};
		for (const d of data) {
			const px = context.xScale(d.weight);
			const py = context.yScale(d.height);
			// Nearer of the two candidate rows' centers
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

<!-- Each hexagon raised by its count, measured by `zScale` (`zDomain` is a share of the largest) -->
<Chart
	{data}
	x="weight"
	y="height"
	xNice
	yNice
	xPadding={[24, 24]}
	yPadding={[24, 24]}
	zDomain={[0, 1]}
	zRange={({ height }) => [0, height * 0.4]}
	tooltipContext
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	{#snippet children({ context })}
		{@const bins = hexbin(context)}
		{@const [fewest, most] = (extent(bins, (b) => b.count) as [number, number]) ?? [0, 1]}
		<!-- Colored by count as `Bin` colors its cells: yellow-green-blue over the counts' range -->
		{@const color = scaleSequential([fewest, most], interpolateYlGnBu)}
		<Scene rotate={25} tilt={60} scrollActivationKey="shift">
			<Grid z={false} />
			<Axis placement="bottom" label="weight (kg)" />
			<Axis placement="left" label="height (m)" />
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
					<Tooltip.Item label="athletes" value={data.count} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
