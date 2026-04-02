<script lang="ts">
	import {
		geoEqualEarth,
		geoEquirectangular,
		geoMercator,
		geoNaturalEarth1,
		geoOrthographic,
		geoCentroid,
		type GeoProjection
	} from 'd3-geo';
	import { feature } from 'topojson-client';

	import { interpolateTurbo } from 'd3-scale-chromatic';

	import { Chart, GeoPath, Graticule, Layer } from 'layerchart';
	import { Button, SelectField } from 'svelte-ux';
	import { getCountriesTopology, getUsStatesTopology } from '$lib/geo.remote';

	const countriesTopo = await getCountriesTopology();
	const countries = feature(countriesTopo, countriesTopo.objects.countries);

	const statesTopo = await getUsStatesTopology();
	const usStates = feature(statesTopo, statesTopo.objects.states);

	const projections = [
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Orthographic', value: geoOrthographic },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Equirectangular', value: geoEquirectangular }
	];

	const goldenRatio = 0.618033988749895;
	let hueOffset = $state(0);

	function nextColor() {
		const color = interpolateTurbo((hueOffset + 0.1) % 1);
		hueOffset = (hueOffset + goldenRatio) % 1;
		return color;
	}

	let projection = $state(geoMercator);

	type SelectedShape = {
		feature: GeoJSON.Feature;
		offset: [number, number];
		rotation: number;
		color: string;
	};

	let selectedShapes = $state<SelectedShape[]>([]);

	const countryOptions = $derived(
		countries.features
			.map((f) => ({ label: f.properties?.name ?? String(f.id), value: f }))
			.filter((o) => o.label)
			.sort((a, b) => a.label.localeCompare(b.label))
	);

	const stateOptions = $derived(
		usStates.features
			.map((f) => ({ label: f.properties?.name ?? String(f.id), value: f }))
			.filter((o) => o.label)
			.sort((a, b) => a.label.localeCompare(b.label))
	);

	let selectedCountry = $state<GeoJSON.Feature | null>(null);
	let selectedState = $state<GeoJSON.Feature | null>(null);

	$effect(() => {
		if (selectedCountry) {
			addShape(selectedCountry);
			selectedCountry = null;
		}
	});

	$effect(() => {
		if (selectedState) {
			addShape(selectedState);
			selectedState = null;
		}
	});

	function addShape(feat: GeoJSON.Feature) {
		const color = nextColor();
		selectedShapes.push({ feature: feat, offset: [0, 0], rotation: 0, color });
	}

	function removeShape(index: number) {
		selectedShapes.splice(index, 1);
	}

	// --- Coordinate transformation (translate + rotate) ---

	function transformCoords(
		coords: GeoJSON.Position | GeoJSON.Position[] | GeoJSON.Position[][] | GeoJSON.Position[][][],
		dLon: number,
		dLat: number,
		angleDeg: number,
		centerLon: number,
		centerLat: number
	): any {
		if (typeof coords[0] === 'number') {
			let [lon, lat] = coords as GeoJSON.Position;
			// Rotate around centroid first, then translate
			if (angleDeg !== 0) {
				const rad = (angleDeg * Math.PI) / 180;
				const cos = Math.cos(rad);
				const sin = Math.sin(rad);
				const dx = lon - centerLon;
				const dy = lat - centerLat;
				lon = centerLon + dx * cos - dy * sin;
				lat = centerLat + dx * sin + dy * cos;
			}
			return [lon + dLon, lat + dLat];
		}
		return (coords as any[]).map((c: any) =>
			transformCoords(c, dLon, dLat, angleDeg, centerLon, centerLat)
		);
	}

	function transformGeometry(
		geometry: GeoJSON.Geometry,
		dLon: number,
		dLat: number,
		angleDeg: number,
		centerLon: number,
		centerLat: number
	): GeoJSON.Geometry {
		if (geometry.type === 'GeometryCollection') {
			return {
				...geometry,
				geometries: geometry.geometries.map((g) =>
					transformGeometry(g, dLon, dLat, angleDeg, centerLon, centerLat)
				)
			};
		}
		return {
			...geometry,
			coordinates: transformCoords(
				(geometry as GeoJSON.Polygon).coordinates,
				dLon,
				dLat,
				angleDeg,
				centerLon,
				centerLat
			)
		};
	}

	function transformFeature(
		feat: GeoJSON.Feature,
		dLon: number,
		dLat: number,
		angleDeg: number
	): GeoJSON.Feature {
		const [centerLon, centerLat] = geoCentroid(feat);
		return {
			...feat,
			geometry: transformGeometry(feat.geometry, dLon, dLat, angleDeg, centerLon, centerLat)
		};
	}

	// --- Drag handling ---

	let dragIndex = $state<number | null>(null);
	let dragStartLonLat = $state<[number, number] | null>(null);
	let dragStartOffset = $state<[number, number] | null>(null);

	function svgPoint(e: PointerEvent): [number, number] {
		const el = e.target as SVGGraphicsElement;
		const pt = new DOMPoint(e.clientX, e.clientY);
		const svgPt = pt.matrixTransform(el.getScreenCTM()!.inverse());
		return [svgPt.x, svgPt.y];
	}

	function startDrag(e: PointerEvent, index: number, proj: GeoProjection | undefined) {
		e.stopPropagation();
		dragIndex = index;
		const coords = svgPoint(e);
		const lonLat = proj?.invert?.(coords);
		if (lonLat) {
			dragStartLonLat = lonLat as [number, number];
			dragStartOffset = [...selectedShapes[index].offset];
		}
		(e.target as Element).setPointerCapture(e.pointerId);
	}

	function onDrag(e: PointerEvent, proj: GeoProjection | undefined) {
		if (dragIndex === null || !dragStartLonLat || !dragStartOffset) return;
		const coords = svgPoint(e);
		const lonLat = proj?.invert?.(coords);
		if (lonLat) {
			selectedShapes[dragIndex].offset = [
				dragStartOffset[0] + (lonLat[0] - dragStartLonLat[0]),
				dragStartOffset[1] + (lonLat[1] - dragStartLonLat[1])
			];
		}
	}

	function endDrag() {
		dragIndex = null;
		dragStartLonLat = null;
		dragStartOffset = null;
	}

	const data = { countriesTopo, statesTopo, countries, usStates };
	export { data };
</script>

<div class="grid gap-2">
	<div class="grid grid-cols-3 gap-2 screenshot-hidden">
		<SelectField
			label="Projection"
			options={projections}
			bind:value={projection}
			clearable={false}
		/>
		<SelectField
			label="Add country"
			options={countryOptions}
			bind:value={selectedCountry}
			search={async (text, options) =>
				options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase()))}
			clearable
			placeholder="Search countries..."
		/>
		<SelectField
			label="Add US state"
			options={stateOptions}
			bind:value={selectedState}
			search={async (text, options) =>
				options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase()))}
			clearable
			placeholder="Search states..."
		/>
	</div>

	{#if selectedShapes.length}
		<div class="flex gap-2 flex-wrap items-center screenshot-hidden">
			{#each selectedShapes as shape, i}
				<div class="flex items-center gap-1 border rounded-lg px-2 py-1">
					<span class="w-3 h-3 rounded-full inline-block shrink-0" style:background={shape.color}
					></span>
					<span class="text-sm whitespace-nowrap"
						>{shape.feature.properties?.name ?? 'Unknown'}</span
					>
					<input
						type="range"
						min={-180}
						max={180}
						step={1}
						bind:value={shape.rotation}
						class="w-20 h-4 accent-current"
						style:color={shape.color}
						title="Rotate: {shape.rotation}°"
					/>
					<span class="text-xs text-surface-content/50 w-8 text-right">{shape.rotation}°</span>
					<button
						class="text-surface-content/40 hover:text-surface-content ml-1"
						onclick={() => removeShape(i)}>×</button
					>
				</div>
			{/each}
		</div>
	{/if}

	<div class="h-150 bg-surface-100/50 border rounded-lg overflow-hidden">
		<Chart
			geo={{
				projection,
				fitGeojson: countries
			}}
			transform={{
				mode: 'projection',
				scrollMode: 'scale',
				scaleExtent: [0.5, 10],
				translateExtent: [
					[-300, -200],
					[300, 200]
				]
			}}
			padding={{ top: 8, bottom: 8, left: 8, right: 8 }}
		>
			{#snippet children({ context })}
				<Layer>
					<Graticule class="stroke-surface-content/10" />
					{#each countries.features as feature}
						<GeoPath geojson={feature} class="stroke-surface-content/20 fill-surface-200" />
					{/each}
				</Layer>

				<Layer>
					{#each selectedShapes as shape, i (i)}
						{@const translated = transformFeature(
							shape.feature,
							shape.offset[0],
							shape.offset[1],
							shape.rotation
						)}
						<GeoPath
							geojson={translated}
							fill={shape.color}
							fill-opacity={0.5}
							stroke={shape.color}
							strokeWidth={2 / context.transform.scale}
							class={dragIndex === i ? 'cursor-grabbing' : 'cursor-grab'}
							onpointerdown={(e) => startDrag(e, i, context.geo.projection)}
							onpointermove={(e) => onDrag(e, context.geo.projection)}
							onpointerup={() => endDrag()}
							onpointercancel={() => endDrag()}
						/>
					{/each}
				</Layer>
			{/snippet}
		</Chart>
	</div>
</div>
