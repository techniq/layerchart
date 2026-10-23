<script module lang="ts">
	import { getCountriesTopology, getUsStatesTopology, getTimezones } from '$lib/geo.remote.js';
	const countriesTopojson = await getCountriesTopology();
	const statesTopojson = await getUsStatesTopology();
	const timezonesTopojson = await getTimezones();

	// Override/ignore Blur compatibility check
	export let layers = ['svg', 'canvas'];
</script>

<script lang="ts">
	import {
		geoAlbersUsa,
		geoAlbers,
		geoArea,
		geoEqualEarth,
		geoEquirectangular,
		geoMercator,
		geoNaturalEarth1,
		geoOrthographic
	} from 'd3-geo';
	import { geoStitch } from 'd3-geo-projection';
	import { extent } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateRdBu } from 'd3-scale-chromatic';
	import { feature } from 'topojson-client';
	// @ts-expect-error
	import { century, equationOfTime, declination } from 'solar-calculator';

	import { Blur, Chart, ClipPath, Layer, Tooltip, antipode } from 'layerchart';
	import { GeoCircle, GeoClipPath, GeoPath } from 'layerchart/geo';
	import TimezonesControls from '$lib/components/controls/GeoPathTimezonesControls.svelte';
	import { TimerState } from '@layerstack/svelte-state';

	let enableClip = $state(false);
	let showDaylight = $state(false);

	// Clip a hair inside the horizon: at exactly 90° d3 decides whether a hidden zone covers the
	// whole globe by testing a pole, where many of the zones meet
	const geoOrthographicGlobe = () => geoOrthographic().clipAngle(89.999);

	let projection = $state(geoNaturalEarth1);
	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Orthographic', value: geoOrthographicGlobe }
	];

	const countriesGeojson = $derived(
		feature(countriesTopojson, countriesTopojson.objects.countries)
	);
	const statesGeojson = $derived(feature(statesTopojson, statesTopojson.objects.states));
	const timezoneGeojson = $derived.by(() => {
		const geojson = feature(timezonesTopojson, timezonesTopojson.objects.timezones);

		// Repair the shapefile-derived polygons so d3 can tell their inside from their outside on a
		// globe, or hidden zones flood it: drop zero-area slivers, move the ±179.99° cut onto the
		// antimeridian and vertices just off the poles, then stitch the cut back together
		const hasArea = (ring: number[][]) => {
			const area = geoArea({ type: 'Polygon', coordinates: [ring] });
			return area > 1e-10 && area < 4 * Math.PI - 1e-10;
		};
		const repair = (ring: number[][]) =>
			ring.map(([x, y]) => [
				Math.abs(x) > 179.98 ? Math.sign(x) * 180 : x,
				Math.max(-89.9999, Math.min(89.9999, y))
			]);

		return geoStitch({
			...geojson,
			features: geojson.features.map((f) => {
				const { geometry } = f;
				const polygons =
					geometry.type === 'Polygon'
						? [geometry.coordinates]
						: geometry.type === 'MultiPolygon'
							? geometry.coordinates
							: [];
				return {
					...f,
					geometry: {
						type: 'MultiPolygon',
						coordinates: polygons
							.map((polygon) => polygon.filter(hasArea).map(repair))
							.filter((polygon) => polygon.length)
					}
				};
			})
		});
	});

	const colorScale = $derived(
		scaleSequential(
			// @ts-expect-error
			extent(timezoneGeojson.features, (d) => d.properties.zone),
			interpolateRdBu
		)
	);

	const dateTimer = new TimerState();

	function formatDate(date: Date, timeZone: string | null) {
		let result = '-';
		if (timeZone) {
			try {
				result = new Intl.DateTimeFormat(undefined, {
					timeStyle: 'medium',
					dateStyle: 'short',
					timeZone
				}).format(date);
			} catch {}
		}

		return result;
	}

	const now = new Date();
	const day = new Date(+now).setUTCHours(0, 0, 0, 0);
	const t = century(now);
	const longitude = ((day - now.valueOf()) / 864e5) * 360 - 180;
	const sun = [longitude - equationOfTime(t) / 4, declination(t)] as [number, number];

	const data = {
		countriesTopojson,
		statesTopojson,
		timezonesTopojson,
		countriesGeojson,
		statesGeojson,
		timezoneGeojson
	};

	export { data };
</script>

<TimezonesControls bind:enableClip bind:showDaylight {projections} bind:projection />

<Chart
	geo={{
		projection,
		fitGeojson: timezoneGeojson
	}}
	transform={projection === geoOrthographicGlobe
		? {
				mode: 'projection',
				motion: 'spring',
				inertia: true,
				constrain: ({ scale, translate }) => ({
					scale,
					translate: { x: translate.x, y: Math.max(-90, Math.min(90, translate.y)) }
				})
			}
		: undefined}
	padding={{ left: 10, right: 10 }}
	height={600}
>
	<Layer>
		<GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content/30" id="globe" />

		<GeoClipPath geojson={countriesGeojson} disabled={!enableClip}>
			{#each timezoneGeojson.features as feature}
				<GeoPath
					geojson={feature}
					tooltip
					fill={colorScale(feature.properties.zone)}
					class="stroke-gray-900/50 hover:brightness-110"
				/>
			{/each}
		</GeoClipPath>

		{#each countriesGeojson.features as feature}
			<GeoPath geojson={feature} class="stroke-gray-900/10 fill-gray-900/20 pointer-events-none" />
		{/each}

		{#each statesGeojson.features as feature}
			<GeoPath geojson={feature} class="stroke-gray-900/10 pointer-events-none" />
		{/each}

		{#if showDaylight}
			<ClipPath useId="globe">
				<Blur>
					<GeoCircle center={antipode(sun)} class="stroke-none fill-black/50 pointer-events-none" />
				</Blur>
			</ClipPath>
		{/if}
	</Layer>

	<Tooltip.Root>
		{#snippet children({ data })}
			{@const { tz_name1st, time_zone, places } = data.properties}
			<Tooltip.List>
				<Tooltip.Item label="Name" value={tz_name1st} />
				<Tooltip.Item label="Places" value={places} classes={{ value: 'max-w-[200px]' }} />
				<Tooltip.Item label="Timezone" value={time_zone} />
				<Tooltip.Item
					label="Current time"
					value={formatDate(dateTimer.current, time_zone.replace('UTC', '').replace('±', '+'))}
				/>
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
