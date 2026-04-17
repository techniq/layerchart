<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote';
	const countriesTopo = await getCountriesTopology();
</script>

<script lang="ts">
	import {
		geoOrthographic,
		geoAzimuthalEqualArea,
		geoCentroid,
		geoBounds,
		geoDistance
	} from 'd3-geo';
	import { cubicInOut } from 'svelte/easing';
	import { feature } from 'topojson-client';

	import {
		Chart,
		GeoPath,
		GeoProjection,
		Graticule,
		Layer,
		Rect,
		type ChartState
	} from 'layerchart';
	import { SelectField } from 'svelte-ux';

	const countries = feature(countriesTopo, countriesTopo.objects.countries);

	// Chart contexts for tweened transforms
	let contextA = $state<ChartState>();
	let contextB = $state<ChartState>();
	let comparisonContext = $state<ChartState>();

	// Derived rotation from each chart's transform (for comparison view + viewport rects)
	const rotateA = $derived<[number, number, number]>(
		contextA?.transform
			? [contextA.transform.translate.x, contextA.transform.translate.y, 0]
			: [-20, 0, 0]
	);
	const rotateB = $derived<[number, number, number]>(
		contextB?.transform
			? [contextB.transform.translate.x, contextB.transform.translate.y, 0]
			: [100, -40, 0]
	);

	// Comparison zoom — driven by the comparison Chart's transform scale
	const comparisonZoom = $derived(comparisonContext?.transform?.scale ?? 3);
	const zoomMin = 1.5;
	const zoomMax = 12;

	// Track comparison chart dimensions for viewport indicator rectangle
	let comparisonContainerW = $state(432);
	let comparisonContainerH = $state(432);

	// Compute viewport indicator rect size in pixels on a globe chart.
	// Azimuthal equal-area: pixel offset d → angular distance θ = 2*asin(d/(2*scale))
	// Orthographic: angular distance θ → pixel offset r = globeRadius * sin(θ)
	function viewportRectSize(globeRadius: number): { w: number; h: number } {
		if (!globeRadius || !comparisonZoom) return { w: 0, h: 0 };
		const compScale = (Math.min(comparisonContainerW, comparisonContainerH) / 2) * comparisonZoom;
		// Angular half-extents visible in the comparison view
		const thetaH = 2 * Math.asin(Math.min(1, comparisonContainerH / 2 / (2 * compScale)));
		const thetaW = 2 * Math.asin(Math.min(1, comparisonContainerW / 2 / (2 * compScale)));
		// Map those angles to pixel distances on the orthographic globe
		return {
			w: 2 * globeRadius * Math.sin(thetaW),
			h: 2 * globeRadius * Math.sin(thetaH)
		};
	}

	// Continent center coordinates for rotation
	const continentCenters: Record<string, [number, number]> = {
		Africa: [20, 0],
		Antarctica: [0, -90],
		Asia: [100, 35],
		Europe: [15, 50],
		'North America': [-100, 40],
		'South America': [-58, -15],
		Oceania: [135, -25]
	};

	const continentOptions = Object.keys(continentCenters)
		.sort()
		.map((name) => ({ label: name, value: name, group: 'Continents' }));

	const countryOptionsList = countries.features
		.map((f) => ({
			label: f.properties?.name ?? String(f.id),
			value: f.properties?.name ?? String(f.id),
			group: 'Countries'
		}))
		.filter((o) => o.label)
		.sort((a, b) => a.label.localeCompare(b.label));

	const allOptions = [...continentOptions, ...countryOptionsList];

	let selectedAName = $state<string | null>(null);
	let selectedBName = $state<string | null>(null);

	function rotateToRegion(name: string, context: ChartState | undefined) {
		if (!context?.transform) return;
		// Check continents first
		if (name in continentCenters) {
			const [lon, lat] = continentCenters[name];
			context.transform.setTranslate({ x: -lon, y: -lat });
			return;
		}
		// Otherwise look up country feature
		const feat = countries.features.find((f) => f.properties?.name === name);
		if (!feat) return;
		const [lon, lat] = geoCentroid(feat);
		context.transform.setTranslate({ x: -lon, y: -lat });
	}

	// Approximate angular radii for continents (degrees)
	const continentRadii: Record<string, number> = {
		Africa: 40,
		Antarctica: 30,
		Asia: 45,
		Europe: 25,
		'North America': 40,
		'South America': 35,
		Oceania: 25
	};

	// Compute the angular radius (in degrees) needed to encompass a region
	function angularExtent(name: string): number {
		if (name in continentRadii) return continentRadii[name];
		const feat = countries.features.find((f) => f.properties?.name === name);
		if (!feat) return 30;
		const center = geoCentroid(feat);
		const bounds = geoBounds(feat);
		// Max angular distance from centroid to bounding box corners
		const corners: [number, number][] = [
			[bounds[0][0], bounds[0][1]],
			[bounds[1][0], bounds[0][1]],
			[bounds[1][0], bounds[1][1]],
			[bounds[0][0], bounds[1][1]]
		];
		const maxDist = Math.max(...corners.map((c) => geoDistance(center, c)));
		return maxDist * (180 / Math.PI); // convert radians to degrees
	}

	// Compute ideal zoom for a given angular radius (degrees)
	// For azimuthal equal-area: zoom = 1 / (2 * sin(θ/2)), with buffer
	function zoomForExtent(angleDeg: number, buffer = 0.85): number {
		const theta = angleDeg * (Math.PI / 180);
		return Math.max(zoomMin, Math.min(zoomMax, buffer / (2 * Math.sin(theta / 2))));
	}

	$effect(() => {
		if (selectedAName) {
			rotateToRegion(selectedAName, contextA);
			// Clear preset if selection doesn't match
			if (selectedPreset) {
				const preset = presets.find((p) => p.label === selectedPreset);
				if (preset && selectedAName !== preset.a) selectedPreset = null;
			}
		}
	});

	$effect(() => {
		if (selectedBName) {
			rotateToRegion(selectedBName, contextB);
			if (selectedPreset) {
				const preset = presets.find((p) => p.label === selectedPreset);
				if (preset && selectedBName !== preset.b) selectedPreset = null;
			}
		}
	});

	// Auto-zoom: reacts to either selection changing
	$effect(() => {
		if (!selectedAName || !selectedBName || !comparisonContext?.transform) return;
		const extentA = angularExtent(selectedAName);
		const extentB = angularExtent(selectedBName);
		comparisonContext.transform.setScale(Math.min(zoomForExtent(extentA), zoomForExtent(extentB)));
	});

	// Presets for quick comparisons (matching reference example)
	const presets: { label: string; a: string; b: string }[] = [
		{ label: 'Africa vs North America', a: 'Africa', b: 'North America' },
		{ label: 'Sweden vs Madagascar', a: 'Sweden', b: 'Madagascar' },
		{ label: 'Australia vs Antarctica', a: 'Australia', b: 'Antarctica' },
		{ label: 'Europe vs Brazil', a: 'Europe', b: 'Brazil' },
		{ label: 'United States vs Australia', a: 'United States of America', b: 'Australia' },
		{ label: 'South America vs Greenland', a: 'South America', b: 'Greenland' },
		{ label: 'Brazil vs United States', a: 'Brazil', b: 'United States of America' },
		{ label: 'Africa vs Russia', a: 'Africa', b: 'Russia' },
		{ label: 'Saudi Arabia vs Alaska', a: 'Saudi Arabia', b: 'United States of America' },
		{ label: 'Europe vs Antarctica', a: 'Europe', b: 'Antarctica' }
	];

	let selectedPreset = $state<string | null>(null);

	function applyPreset(preset: { label: string; a: string; b: string }) {
		selectedAName = preset.a;
		selectedBName = preset.b;
		selectedPreset = preset.label;
	}

	// Drag on comparison view rotates both globes together
	let draggingBoth = $state(false);
	let dragStart = $state<{
		x: number;
		y: number;
		rA: [number, number, number];
		rB: [number, number, number];
	} | null>(null);

	function startBothDrag(e: PointerEvent) {
		draggingBoth = true;
		dragStart = { x: e.clientX, y: e.clientY, rA: [...rotateA], rB: [...rotateB] };
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
	}

	function onBothDrag(e: PointerEvent) {
		if (!draggingBoth || !dragStart) return;
		const dx = e.clientX - dragStart.x;
		const dy = e.clientY - dragStart.y;
		const sensitivity = 0.5 / comparisonZoom;
		contextA?.transform?.setTranslate(
			{
				x: dragStart.rA[0] + dx * sensitivity,
				y: Math.max(-90, Math.min(90, dragStart.rA[1] - dy * sensitivity))
			},
			{ duration: 0 }
		);
		contextB?.transform?.setTranslate(
			{
				x: dragStart.rB[0] + dx * sensitivity,
				y: Math.max(-90, Math.min(90, dragStart.rB[1] - dy * sensitivity))
			},
			{ duration: 0 }
		);
	}

	function endBothDrag() {
		draggingBoth = false;
		dragStart = null;
	}

	// Transform motion config shared by both globe charts
	const transformMotion = {
		mode: 'projection' as const,
		motion: { type: 'tween' as const, duration: 800, easing: cubicInOut },
		inertia: true,
	};

	// Set initial positions once contexts are ready
	let initialized = false;
	$effect(() => {
		if (
			!initialized &&
			contextA?.transform &&
			contextB?.transform &&
			comparisonContext?.transform
		) {
			initialized = true;
			applyPreset(presets[0]);
		}
	});

	const data = { countriesTopo, countries };
	export { data };
</script>

<div class="grid gap-2">
	<div class="grid grid-cols-[1fr_1fr_auto] gap-2 items-end screenshot-hidden">
		<SelectField
			label="Region A"
			options={allOptions}
			bind:value={selectedAName}
			search={async (text, options) =>
				options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase()))}
			placeholder="Search countries..."
			clearable={false}
			stepper
		/>
		<SelectField
			label="Region B"
			options={allOptions}
			bind:value={selectedBName}
			search={async (text, options) =>
				options.filter((o) => o.label.toLowerCase().includes(text.toLowerCase()))}
			placeholder="Search countries..."
			clearable={false}
			stepper
		/>
		<SelectField
			label="Presets"
			options={presets.map((p) => ({ label: p.label, value: p.label }))}
			bind:value={selectedPreset}
			on:change={(e) => {
				const preset = presets.find((p) => p.label === e.detail.value);
				if (preset) applyPreset(preset);
			}}
			placeholder="Quick compare..."
			stepper
		/>
	</div>

	<div class="grid grid-cols-[280px_1fr] gap-2">
		<!-- Left: Two globes stacked -->
		<div class="grid gap-2">
			<!-- Globe A -->
			<div class="border rounded-lg overflow-hidden bg-surface-100/50">
				<div class="text-xs font-medium px-2 pt-1 text-surface-content/60">Region A</div>
				<div class="h-52">
					<Chart
						geo={{ projection: geoOrthographic, fitGeojson: { type: 'Sphere' } }}
						transform={transformMotion}
						bind:context={contextA}
						padding={{ top: 4, bottom: 4, left: 4, right: 4 }}
					>
						{#snippet children({ context })}
							{@const globeR = Math.min(context.width, context.height) / 2}
							{@const vp = viewportRectSize(globeR)}
							<Layer>
								<GeoPath
									geojson={{ type: 'Sphere' }}
									class="fill-surface-200/50 stroke-surface-content/20"
								/>
								<Graticule class="stroke-surface-content/10" />
								{#each countries.features as feat, i (feat.id ?? i)}
									<GeoPath geojson={feat} class="fill-surface-content/70 stroke-surface-100/30" />
								{/each}
							</Layer>
							<Layer>
								<Rect
									x={context.width / 2 - vp.w / 2}
									y={context.height / 2 - vp.h / 2}
									width={vp.w}
									height={vp.h}
									class="fill-surface-content/10 stroke-surface-content/50"
									strokeWidth={1.5}
									rx={1}
								/>
							</Layer>
						{/snippet}
					</Chart>
				</div>
			</div>

			<!-- Globe B -->
			<div class="border rounded-lg overflow-hidden bg-surface-100/50">
				<div class="text-xs font-medium px-2 pt-1 text-surface-content/60">Region B</div>
				<div class="h-52">
					<Chart
						geo={{ projection: geoOrthographic, fitGeojson: { type: 'Sphere' } }}
						transform={transformMotion}
						bind:context={contextB}
						padding={{ top: 4, bottom: 4, left: 4, right: 4 }}
					>
						{#snippet children({ context })}
							{@const globeR = Math.min(context.width, context.height) / 2}
							{@const vp = viewportRectSize(globeR)}
							<Layer>
								<GeoPath
									geojson={{ type: 'Sphere' }}
									class="fill-surface-200/50 stroke-surface-content/20"
								/>
								<Graticule class="stroke-surface-content/10" />
								{#each countries.features as feat, i (feat.id ?? i)}
									<GeoPath
										geojson={feat}
										class="fill-primary/70 stroke-primary-content/30"
										strokeWidth={0.5}
									/>
								{/each}
							</Layer>
							<Layer>
								<Rect
									x={context.width / 2 - vp.w / 2}
									y={context.height / 2 - vp.h / 2}
									width={vp.w}
									height={vp.h}
									class="fill-primary/10 stroke-surface-content/50"
									strokeWidth={1.5}
									rx={1}
								/>
							</Layer>
						{/snippet}
					</Chart>
				</div>
			</div>
		</div>

		<!-- Right: Comparison view — overlays both globe perspectives as a flat square -->
		<div class="border rounded-lg overflow-hidden bg-surface-100/50">
			<div class="text-xs font-medium px-2 pt-1 text-surface-content/60">
				True size comparison (Equal-Area)
			</div>
			<div
				bind:clientWidth={comparisonContainerW}
				bind:clientHeight={comparisonContainerH}
				class="h-108 cursor-grab overflow-hidden"
				class:cursor-grabbing={draggingBoth}
				role="application"
				onpointerdown={startBothDrag}
				onpointermove={onBothDrag}
				onpointerup={endBothDrag}
				onpointercancel={endBothDrag}
			>
				<Chart
					geo={{
						projection: geoAzimuthalEqualArea,
						fitGeojson: { type: 'Sphere' }
					}}
					transform={{
						mode: 'manual',
						scrollMode: 'scale',
						initialScale: 3,
						scaleExtent: [zoomMin, zoomMax],
						motion: { type: 'tween', duration: 800, easing: cubicInOut }
					}}
					bind:context={comparisonContext}
					padding={{ top: 0, bottom: 0, left: 0, right: 0 }}
				>
					{#snippet children({ context })}
						{@const baseScale = Math.min(context.width, context.height) / 2}
						{@const scale = baseScale * context.transform.scale}
						{@const cx = context.width / 2}
						{@const cy = context.height / 2}

						<!-- Region A -->
						<Layer>
							<GeoProjection
								projection={() => geoAzimuthalEqualArea().clipAngle(150)}
								rotate={{ yaw: rotateA[0], pitch: rotateA[1], roll: rotateA[2] }}
								{scale}
								translate={[cx, cy]}
							>
								<Graticule class="stroke-surface-content/5" />
								{#each countries.features as feat, i (feat.id ?? i)}
									<GeoPath
										geojson={feat}
										class="fill-surface-content/80 stroke-surface-100/30"
										strokeWidth={0.5}
									/>
								{/each}
							</GeoProjection>
						</Layer>

						<!-- Region B - blended -->
						<Layer>
							<GeoProjection
								projection={() => geoAzimuthalEqualArea().clipAngle(150)}
								rotate={{ yaw: rotateB[0], pitch: rotateB[1], roll: rotateB[2] }}
								{scale}
								translate={[cx, cy]}
							>
								{#each countries.features as feat, i (feat.id ?? i)}
									<GeoPath
										geojson={feat}
										class="fill-primary/50 stroke-primary-content"
										strokeWidth={0.5}
									/>
								{/each}
							</GeoProjection>
						</Layer>
					{/snippet}
				</Chart>
			</div>
		</div>
	</div>
</div>
