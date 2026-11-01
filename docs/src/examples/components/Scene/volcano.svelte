<script module lang="ts">
	import { getVolcano } from '$lib/data.remote.js';
	const volcano = await getVolcano();
</script>

<script lang="ts">
	import { Chart, Contour, Light, Raster, Scene, Surface, Tooltip } from '@layerchart/3d';
	import { extent } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateViridis } from 'd3-scale-chromatic';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	let style = $state<'raised' | 'flat'>('raised');
</script>

<Field label="Style">
	<ToggleGroup bind:value={style} variant="outline">
		<ToggleOption value="raised">Raised</ToggleOption>
		<ToggleOption value="flat">Flat</ToggleOption>
	</ToggleGroup>
</Field>

<!-- Maungawhau (Mt. Eden), Auckland: an 87 × 61 elevation grid -->
<Chart
	cScale={scaleSequential(interpolateViridis)}
	zDomain={extent(volcano.values) as [number, number]}
	zRange={({ height }) => [0, height * 0.35]}
	tooltipContext
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<Scene rotate={-25} tilt={55} scrollActivationKey="shift">
		<Light azimuth={315} altitude={35} intensity={0.9} shadow />
		<Light type="ambient" intensity={0.55} />
		{#if style === 'raised'}
			<Surface
				data={volcano.values}
				width={volcano.width}
				height={volcano.height}
				contours={10}
				tooltip
			/>
		{:else}
			<Raster data={volcano.values} width={volcano.width} height={volcano.height} tooltip />
			<Contour
				data={volcano.values}
				width={volcano.width}
				height={volcano.height}
				thresholds={10}
				stroke="color-mix(in oklab, white 70%, transparent)"
			/>
		{/if}
	</Scene>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="elevation" value={data.value} format="integer" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
