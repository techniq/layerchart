<script lang="ts">
	import { getContext } from 'svelte';
	import { scaleCanvas } from 'layercake';

	import { geoContext } from './GeoContext.svelte';

	/** Latitude */
	export let lat: number;
	/** Longitude */
	export let long: number;

	/** Render to canvas */
	export let render: (
		ctx: CanvasRenderingContext2D,
		coords: { x: number; y: number }
	) => any = () => {};

	const { width, height } = getContext('LayerCake');
	const canvas = getContext('canvas');
	const geo = geoContext();

	$: [x, y] = $geo.projection([long, lat]) ?? [0, 0];

	$: renderContext = canvas ? 'canvas' : 'svg';

	$: ctx = canvas?.ctx;
	$: if (renderContext === 'canvas' && $ctx) {
		// console.count('render');
		scaleCanvas($ctx, $width, $height);
		$ctx.clearRect(0, 0, $width, $height);

		render($ctx, { x, y });
	}
</script>

{#if renderContext === 'svg'}
	<g transform="translate({x},{y})">
		<slot />
	</g>
{/if}
