<script lang="ts">
	import { Chart, GeoTile, WebGL, globe, perspective } from '@layerchart/webgl';
	import { getSettings } from 'layerchart';

	const settings = getSettings();

	// Satellite imagery covers the whole world to zoom 12 (beyond, only where there are orthophotos)
	const url = (x: number, y: number, z: number) =>
		`https://tiles.versatiles.org/tiles/satellite-raster/${z}/${x}/${y}`;
</script>

<!-- The same tiles wrapped around the globe: sharper wherever the camera comes close.  Drag to
     turn it, and shift-scroll to zoom in -->
<Chart
	padding={24}
	view={perspective({ rotate: -20, tilt: 60 })}
	transform={{
		mode: 'canvas',
		drag: 'rotate',
		scrollMode: 'scale',
		scrollActivationKey: 'shift',
		// Zoom in close, but never inside the globe
		scaleExtent: [0.5, 40],
		// Tip on round to the south pole, rather than stopping edge on
		tiltExtent: [0, 180]
	}}
	geo={{ projection: globe, fitGeojson: { type: 'Sphere' } }}
	height={600}
	class="rounded-sm bg-black"
>
	<WebGL>
		<GeoTile {url} maxZoom={12} debug={settings.debug} />
	</WebGL>
</Chart>
