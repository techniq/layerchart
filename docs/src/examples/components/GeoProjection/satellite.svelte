<script module lang="ts">
	import { getUsStatesTopology } from '$lib/geo.remote';
	const topology = await getUsStatesTopology();
</script>

<script lang="ts">
	import { geoSatellite } from 'd3-geo-projection';
	import { merge } from 'topojson-client';

	import { Chart, Layer } from 'layerchart';
	import { GeoPath, Graticule } from 'layerchart/geo';
	import { RangeField } from 'svelte-ux';
	const land = merge(topology, topology.objects.states.geometries as any);

	let yaw = $state(76);
	let pitch = $state(-34.5);
	let roll = $state(32.12);
	let distance = $state(1.1);
	let scale = $state(5500);
	let tilt = $state(25);

	const clipAngle = $derived((Math.acos(1 / distance) * 180) / Math.PI - 1e-6);

	const projection = $derived(() => {
		const p = geoSatellite()
			.distance(distance)
			.tilt(tilt)
			.scale(scale)
			.rotate([yaw, pitch, roll])
			.center([-2, 5]);
		p.clipAngle(clipAngle);
		return p;
	});

	const data = { topology };

	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-3 mb-2">
	<RangeField label="Yaw" bind:value={yaw} min={-180} max={180} step={1} />
	<RangeField label="Pitch" bind:value={pitch} min={-90} max={90} step={1} />
	<RangeField label="Roll" bind:value={roll} min={-180} max={180} step={1} />
	<RangeField label="Distance" bind:value={distance} min={1.01} max={10} step={0.01} />
	<RangeField label="Scale" bind:value={scale} min={500} max={20000} step={100} />
	<RangeField label="Tilt" bind:value={tilt} min={-90} max={90} step={1} />
</div>

<Chart
	geo={{ projection }}
	padding={{ top: 16, bottom: 16, left: 16, right: 16 }}
	height={600}
	clip
>
	<Layer>
		<GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content/30" />
		<Graticule class="stroke-surface-content/10" />
		<GeoPath geojson={land} class="fill-surface-content/10 stroke-surface-content/30" />
	</Layer>
</Chart>
