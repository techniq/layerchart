<script module lang="ts">
	import { getVolcano } from '$lib/data.remote.js';
	const volcano = await getVolcano();
</script>

<script lang="ts">
	import { mean } from 'd3-array';
	import { Bin, Chart, Image, Layer } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	// Maunga Whau's elevation, sampled on a grid
	const data = volcano.values.map((value, i) => ({
		x: i % volcano.width,
		y: Math.floor(i / volcano.width),
		value
	}));
	export { data };

	let size = $state(36);

	// Terrain tiles from Kenney's Hexagon Pack (CC0), https://kenney.nl/assets/hexagon-pack —
	// pointy-topped hexagons 120px across their flats, as Bin draws them
	const bands = [
		{ below: 110, tiles: ['sand_07', 'sand_12'] },
		{ below: 125, tiles: ['grass_05', 'grass_19'] },
		{ below: 140, tiles: ['grass_10', 'grass_11', 'grass_05'] },
		{ below: 155, tiles: ['grass_12', 'grass_13'] },
		{ below: 170, tiles: ['dirt_12', 'dirt_13', 'dirt_14'] },
		{ below: 182, tiles: ['dirt_15', 'dirt_16'] },
		{ below: Infinity, tiles: ['dirt_18', 'grass_14'] }
	];

	/**
	 * The tile for a cell's mean elevation — a variant picked by its first sample's place on the grid,
	 * so neighbors differ but a cell keeps its tile however the chart is drawn
	 */
	function tile(cell: { x: number; y: number; data: typeof data }) {
		const elevation = mean(cell.data, (d) => d.value) ?? 0;
		const { tiles } = bands.find((band) => elevation < band.below)!;
		const variant = (cell.data[0].x * 7 + cell.data[0].y * 13) % tiles.length;
		return `/images/kenney-hexagon/${tiles[variant]}.png`;
	}
</script>

<div class="mb-4">
	<RangeField label="Size" bind:value={size} min={20} max={80} step={1} />
</div>

<!-- Padded by a tile, and clipped, as the cells at the edges reach past the plot -->
<Chart {data} x="x" y="y" padding={size} height={500} clip>
	<Layer>
		<Bin {size}>
			{#snippet children({ cells })}
				<!-- Back to front, so trees and rocks stand over the row behind -->
				{#each [...cells].sort((a, b) => a.y - b.y || a.x - b.x) as cell (`${cell.x},${cell.y}`)}
					<!-- A tile is 140px tall to its 120px width -->
					<Image href={tile(cell)} x={cell.x} y={cell.y} width={size} height={(size * 140) / 120} />
				{/each}
			{/snippet}
		</Bin>
	</Layer>
</Chart>
