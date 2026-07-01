<script lang="ts">
	import { Chart, Layer, Polygon } from 'layerchart';
	import PolygonPlaygroundControls from '$lib/components/controls/PolygonPlaygroundControls.svelte';

	let config = $state({
		points: 8,
		cornerRadius: 0,
		inset: 0,
		rotate: 0,
		scaleX: 1,
		scaleY: 1,
		skewX: 0,
		skewY: 0,
		tiltX: 0,
		tiltY: 0
	});
</script>

<PolygonPlaygroundControls bind:config />

<Chart height={300}>
	{#snippet children({ context })}
		<Layer>
			<Polygon cx={context.width / 2} cy={context.height / 2} r={100} {...config} />
		</Layer>
	{/snippet}
</Chart>
