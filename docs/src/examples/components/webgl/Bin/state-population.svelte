<script module lang="ts">
	import { getPopulationStates, getStatePopulation, getUsStatesTopology } from '$lib/geo.remote.js';
	const topology = await getUsStatesTopology();
	const stateOptions = await getPopulationStates();
</script>

<script lang="ts">
	import { geoBounds, geoCentroid, geoConicEqualArea } from 'd3-geo';
	import { scaleSequentialLog, scaleSqrt } from 'd3-scale';
	import {
		interpolateBlues,
		interpolateBuGn,
		interpolateOrRd,
		interpolatePurples,
		interpolateRdPu,
		interpolateReds
	} from 'd3-scale-chromatic';
	import { feature } from 'topojson-client';
	import { SelectField } from 'svelte-ux';
	import {
		Bin,
		Chart,
		GeoPath,
		Light,
		Link,
		Rect,
		Text,
		Tooltip,
		WebGL,
		perspective
	} from '@layerchart/webgl';

	/** d3's sequential schemes, from the emptiest hexagons (near white) to the densest */
	const palettes = [
		{ label: 'Blues', value: interpolateBlues },
		{ label: 'Blue Greens', value: interpolateBuGn },
		{ label: 'Purples', value: interpolatePurples },
		{ label: 'Reds', value: interpolateReds },
		{ label: 'Red Purples', value: interpolateRdPu },
		{ label: 'Orange Reds', value: interpolateOrRd }
	];

	let selected = $state('west-virginia');
	// Bound by label: the field drops array values
	let palette = $state('Blues');
	const interpolator = $derived(palettes.find((p) => p.label === palette)!.value);

	// `.current` rather than `await`: an awaited derived holds back every other update on the page
	// until it lands, stalling an animated chart beside it (https://github.com/sveltejs/svelte/issues/18997)
	const loading = $derived(getStatePopulation(selected));
	const population = $derived(loading.current ?? { cells: [], cities: [] });
	const outline = $derived(
		feature(topology, topology.objects.states).features.find(
			(f) => f.properties.name === stateOptions.find((s) => s.value === selected)?.label
		)!
	);

	/**
	 * Equal-area, centered on the state, so every hexagon covers the same ground (Alaska's
	 * included, across the antimeridian)
	 */
	const projection = $derived.by(() => {
		const [[, south], [, north]] = geoBounds(outline);
		const [longitude] = geoCentroid(outline);
		const third = (north - south) / 3;
		return () =>
			geoConicEqualArea()
				.parallels([south + third, north - third])
				.rotate([-longitude, 0]);
	});

	type Cell = [longitude: number, latitude: number, people: number];
	type City = [name: string, longitude: number, latitude: number];
	/** Square miles in a square meter */
	const SQ_MI = 1 / 2_589_988;
	export { population as data };
</script>

<div class="grid grid-cols-[1fr_auto] gap-2 mb-2">
	<SelectField
		label="State"
		options={stateOptions}
		bind:value={selected}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<SelectField
		label="Colors"
		options={palettes.map(({ label }) => ({ label, value: label }))}
		bind:value={palette}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>

<!-- People per square mile, binned into hexagons: each stands as tall as it is dense, lit by a low
     sun from the northwest so the cities cast long shadows.  Data: Kontur Population 2023 -->
<Chart
	view={perspective({ rotate: 0, tilt: 35, fov: 30 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	data={population.cells}
	x={(d: Cell) => d[0]}
	y={(d: Cell) => d[1]}
	geo={{ projection, fitGeojson: outline }}
	zScale={scaleSqrt()}
	cScale={scaleSequentialLog(interpolator)}
	zRange={({ height }) => [0, height * 0.25]}
	tooltipContext
	height={600}
>
	{#snippet children({ context })}
		{@const project = context.geo.projection}
		{@const center = project?.invert?.([context.width / 2, context.height / 2]) ?? [0, 0]}
		<!-- The pixels a square meter covers: a small patch of ground at the state's middle, projected -->
		{@const pixelsPerSqMeter = (() => {
			if (!project) return 1;
			const [lon, lat] = center;
			const d = 0.01;
			const a = project([lon, lat]);
			const b = project([lon + d, lat]);
			const c = project([lon, lat + d]);
			if (!a || !b || !c) return 1;
			const pixels = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
			const meters = d * 111_320 * Math.cos((lat * Math.PI) / 180) * (d * 110_574);
			return pixels / meters;
		})()}
		<!-- A hexagon's people over its ground area -->
		{@const density = (cell: { count: number; area: number }) =>
			cell.count / ((cell.area / pixelsPerSqMeter) * SQ_MI)}
		<WebGL>
			<Light azimuth={315} altitude={22} intensity={1.1} shadow />
			<Light type="ambient" intensity={0.65} />

			<!-- The page the state lies on, to catch the shadows -->
			<Rect
				x={-context.width}
				y={-context.height}
				width={context.width * 3}
				height={context.height * 3}
				z={0.1}
				fill="var(--color-surface-200)"
			/>
			<GeoPath geojson={outline} fill="var(--color-surface-100)" />

			<!-- Colored from 10 people a square mile (wilderness) up, on a log scale -->
			<Bin
				size={14}
				gap={1}
				weight={(d: Cell) => d[2]}
				z={density}
				fill={(cell) => Math.max(10, density(cell))}
				tooltip
			/>

			<!-- Each city on a stem above its densest hexagons -->
			<Link
				data={population.cities}
				x1={(city: City) => city[1]}
				y1={(city: City) => city[2]}
				z2={context.zDepth * 0.9}
				stroke="color-mix(in oklab, var(--color-surface-content) 60%, transparent)"
			/>
			<Text
				data={population.cities}
				x={(city: City) => city[1]}
				y={(city: City) => city[2]}
				z={context.zDepth * 0.9 + 10}
				value={(city: City) => city[0]}
				viewport
				class="rounded-sm bg-surface-100/90 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-surface-content shadow-sm ring-1 ring-surface-content/15"
			/>
		</WebGL>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.List>
					<Tooltip.Item label="People" value={data.count} format="integer" />
					<Tooltip.Item label="Per sq mi" value={density(data)} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
