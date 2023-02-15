<script lang="ts">
	import { getContext } from 'svelte';
	import { scaleCanvas } from 'layercake';
	import { tile as d3Tile } from 'd3-tile';

	import { geoContext } from './GeoContext.svelte';

	export let url: (x: number, y: number, z: number) => string = () => '';
	export let zoomDelta = 0;

	const { width, height } = getContext('LayerCake');
	const canvas = getContext('canvas');
	const geo = geoContext();

	$: tile = d3Tile()
		.size([$width, $height])
		.scale($geo.projection.scale() * 2 * Math.PI)
		.translate($geo.projection([0, 0]))
		.zoomDelta(zoomDelta);

	$: tiles = tile();
	$: ({
		translate: [tx, ty],
		scale: k
	} = tiles);

	$: renderContext = canvas ? 'canvas' : 'svg';

	$: ctx = canvas?.ctx;
	$: if (renderContext === 'canvas' && $ctx) {
		// console.count('render');
		scaleCanvas($ctx, $width, $height);
		$ctx.clearRect(0, 0, $width, $height);

		tiles.forEach(([x, y, z]) => {
			const image = new Image();
			image.onload = () => {
				$ctx.drawImage(image, (x + tx) * k, (y + ty) * k, k, k);
			};
			image.src = url(x, y, z);
		});
	}
</script>

{#if renderContext === 'svg'}
	<slot {tiles}>
		{#each tiles as [x, y, z], i}
			<!-- To avoid aliasing artifacts (thin white lines) between tiles, two layers of tiles are drawn, with the lower layer’s tiles enlarged by one pixel -->
			<image
				xlink:href={url(x, y, z)}
				x={(x + tx) * k - 0.5}
				y={(y + ty) * k - 0.5}
				width={k + 1}
				height={k + 1}
			/>
			<image xlink:href={url(x, y, z)} x={(x + tx) * k} y={(y + ty) * k} width={k} height={k} />
		{/each}
	</slot>
{/if}
