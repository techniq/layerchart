<script lang="ts">
	import { range } from 'd3-array';
	import { randomNormal } from 'd3-random';
	import { Field, Switch } from 'svelte-ux';

	import { Chart, Circle, Layer, Link, Text, Voronoi } from 'layerchart';

	const width = 900;
	const height = 600;
	const randomX = randomNormal(width / 2, 80);
	const randomY = randomNormal(height / 2, 80);
	const data = range(200)
		.map(() => ({ x: randomX(), y: randomY() }))
		.filter((d) => d.x >= 0 && d.x <= width && d.y >= 0 && d.y <= height);

	const fontSize = 10;
	const gap = 6;

	const orient = [
		{ textAnchor: 'start', dx: gap, dy: 0 },
		{ textAnchor: 'middle', dx: 0, dy: gap + fontSize / 2 },
		{ textAnchor: 'end', dx: -gap, dy: 0 },
		{ textAnchor: 'middle', dx: 0, dy: -(gap + fontSize / 2) }
	] as const;

	let showVoronoi = $state(true);
	let showCentroidLines = $state(true);

	export { data };
</script>

<div class="flex gap-4 mb-2 screenshot-hidden">
	<Field label="Show voronoi" let:id>
		<Switch bind:checked={showVoronoi} {id} />
	</Field>
	<Field label="Show centroid lines" let:id>
		<Switch bind:checked={showCentroidLines} {id} />
	</Field>
</div>

<Chart {data} x="x" xDomain={[0, width]} y="y" yDomain={[0, height]} padding={16} height={500}>
	<Layer>
		<Voronoi classes={{ path: showVoronoi ? 'stroke-surface-content/20' : 'stroke-none' }}>
			{#snippet children({ cells })}
				<!-- Label cells with enough surrounding space (relative to the average cell) -->
				{@const avgArea = cells.reduce((sum, c) => sum + c.area, 0) / cells.length}
				{@const areaThreshold = avgArea * 0.72}

				{#if showCentroidLines}
					{#each cells as cell (cell.index)}
						{#if cell.centroid}
							<Link
								x1={cell.centroid[0]}
								y1={cell.centroid[1]}
								x2={cell.point[0]}
								y2={cell.point[1]}
								type="straight"
								class="stroke-warning/70"
							/>
						{/if}
					{/each}
				{/if}

				{#each cells as cell (cell.index)}
					<Circle cx={cell.point[0]} cy={cell.point[1]} r={2} class="fill-surface-content" />
				{/each}

				{#each cells as cell (cell.index)}
					{#if cell.centroid && cell.area > areaThreshold}
						{@const [px, py] = cell.point}
						{@const [cx, cy] = cell.centroid}
						{@const angle = (Math.round((Math.atan2(cy - py, cx - px) / Math.PI) * 2) + 4) % 4}
						{@const o = orient[angle]}
						<Text
							value={cell.index}
							x={px}
							y={py}
							dx={o.dx}
							dy={o.dy}
							{fontSize}
							textAnchor={o.textAnchor}
							verticalAnchor="middle"
							class="fill-surface-content pointer-events-none"
						/>
					{/if}
				{/each}
			{/snippet}
		</Voronoi>
	</Layer>
</Chart>
