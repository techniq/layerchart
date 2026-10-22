<script module lang="ts">
	import { getVolcano } from '$lib/data.remote.js';
	const volcano = await getVolcano();
</script>

<script lang="ts">
	import { mean } from 'd3-array';
	import { Bin, type BinCell, Chart, Image, isometric, Layer, Path } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	const data = volcano.values.map((value, i) => ({
		x: i % volcano.width,
		y: Math.floor(i / volcano.width),
		value
	}));
	export { data };

	let size = $state(30);

	// Terrain tiles from Kenney's Hexagon Pack (CC0), https://kenney.nl/assets/hexagon-pack, with the
	// color of the ground each stands on for its sides
	const bands = [
		{ below: 110, tiles: ['sand_07', 'sand_12'], ground: '#e5d5b2' },
		{ below: 125, tiles: ['grass_05', 'grass_19'], ground: '#27ae60' },
		{ below: 140, tiles: ['grass_10', 'grass_11', 'grass_05'], ground: '#27ae60' },
		{ below: 155, tiles: ['grass_12', 'grass_13'], ground: '#27ae60' },
		{ below: 170, tiles: ['dirt_12', 'dirt_13', 'dirt_14'], ground: '#b8783c' },
		{ below: 182, tiles: ['dirt_15', 'dirt_16'], ground: '#b8783c' },
		{ below: Infinity, tiles: ['dirt_18'], ground: '#b8783c' }
	];

	/** A cell's height, tile (by its first sample's place on the grid, so it keeps it), and ground */
	function terrain(cell: BinCell<(typeof data)[number]>) {
		const elevation = mean(cell.data, (d) => d.value) ?? 0;
		const band = bands.find((band) => elevation < band.below)!;
		const variant = (cell.data[0].x * 7 + cell.data[0].y * 13) % band.tiles.length;
		return {
			// Raised a pixel for every 1.5m above the lowest ground
			height: (elevation - 90) / 1.5,
			tile: `/images/kenney-hexagon/${band.tiles[variant]}.png`,
			ground: band.ground
		};
	}
</script>

<div class="mb-4">
	<RangeField label="Size" bind:value={size} min={16} max={60} step={1} />
</div>

<!-- Each hexagon raised by its mean elevation, with a tile on top.  Drag to rotate, and hold shift to
     zoom. -->
<Chart
	{data}
	x="x"
	y="y"
	view={isometric({ rotate: -30, tilt: 55 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	padding={24}
	height={550}
>
	{#snippet children({ context })}
		<!-- The floor is refitted as the view turns, its cells with it, so tiles and heights scale too -->
		{@const scale = context.floorScale}
		<Layer>
			<Bin {size}>
				{#snippet children({ cells })}
					<!-- Back to front, each column then its tile — keyed by index, as canvas paints in the
					     order listed -->
					{#each cells as cell, i (i)}
						{@const t = terrain(cell)}
						{@const height = t.height * scale}
						<Path pathData={`M${cell.polygon.join('L')}Z`} z={height} fill={t.ground} />
						<!-- On the column's top -->
						<Image
							href={t.tile}
							x={cell.x}
							y={cell.y}
							z={height}
							width={size * scale}
							height={(size * scale * 140) / 120}
						/>
					{/each}
				{/snippet}
			</Bin>
		</Layer>
	{/snippet}
</Chart>
