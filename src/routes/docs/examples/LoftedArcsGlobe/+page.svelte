<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { geoOrthographic, geoInterpolate } from 'd3-geo';
	import { curveNatural } from 'd3-shape';
	import { feature } from 'topojson-client';

	import { Field, Switch } from 'svelte-ux';

	import GeoDebug from '$lib/docs/GeoDebug.svelte';
	import Preview from '$lib/docs/Preview.svelte';

	import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import Graticule from '$lib/components/Graticule.svelte';
	import Path from '$lib/components/Path.svelte';
	import Zoom from '$lib/components/Zoom.svelte';

	import EdgeFade from './EdgeFade.svelte';
	import links from '../_data/geo/world-links.json';

	export let data;

	const countries = feature(data.geojson, data.geojson.objects.countries);

	const translate = [480, 350];
	const loftedProjection = geoOrthographic()
		.translate(translate)
		.scale(249.5 * 1.3);

	let scale = 0;
	let yaw = 0;
	let pitch = 0;
	let roll = 0;
	let sensitivity = 75;

	let zoom;
	let scrollMode = 'scale';
	let debug = false;
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<div class="grid grid-cols-[auto,1fr] gap-2 my-2">
	<Field label="Debug" let:id>
		<Switch bind:checked={debug} {id} />
	</Field>
</div>

<Preview>
	<div class="h-[600px] overflow-hidden">
		<Chart
			geo={{
				projection: geoOrthographic,
				_fitGeojson: countries,
				rotate: {
					yaw,
					pitch,
					roll
				},
				_scale: scale,
				translate: translate
			}}
			let:projection
		>
			{#if debug}
				<GeoDebug class="absolute top-0 left-0 z-10" />
			{/if}
			<Svg>
				<Zoom
					mode="manual"
					_initialScale={projection.scale()}
					_initialTranslate={{ x: projection.translate()[0], y: projection.translate()[1] }}
					bind:this={zoom}
					scroll="none"
					tweened={{ duration: 800, easing: cubicOut }}
					let:zoomTo
					let:reset={resetZoom}
					on:zoom={(e) => {
						//scale = e.detail.scale;
						const scale = 250;
						yaw = e.detail.translate.x * (sensitivity / scale);
						pitch = -e.detail.translate.y * (sensitivity / scale);
						loftedProjection.rotate([yaw, pitch]);
					}}
				>
					<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-300" on:click={() => (yaw += 1)} />
					<Graticule class="stroke-black/20 fill-none pointer-events-none" />
					{#each countries.features as country}
						<GeoPath geojson={country} class="fill-white pointer-events-none" />
					{/each}
					{#each links as link}
						{@const source = projection(link.source)}
						{@const target = projection(link.target)}
						{@const middle = loftedProjection(geoInterpolate(link.source, link.target)(0.5))}
						{@const pathData = [source, middle, target]}
						<EdgeFade {link}>
							<circle cx={source[0]} cy={source[1]} r={2} class="fill-black-500" />>
							<circle cx={target[0]} cy={target[1]} r={2} class="fill-black-500" />>
							<Path
								data={pathData}
								x={(d) => d[0]}
								y={(d) => d[1]}
								defined={(d) => projection.invert(d)}
								curve={curveNatural}
								class="fill-none stroke-red-500 stroke-2"
							/>
							<GeoPath geojson={link.feature} class="stroke-gray-500/30 stroke-2" />
						</EdgeFade>
					{/each}
				</Zoom>
			</Svg>
		</Chart>
	</div>
</Preview>
