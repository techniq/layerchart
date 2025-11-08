<script lang="ts">
	import { Chart, Layer, Polygon } from 'layerchart';
	import PolygonControls from '$lib/components/PolygonControls.svelte';

	let rotate = $state(0);
	let cornerRadius = $state(0);
</script>

<PolygonControls bind:rotate bind:cornerRadius />
<Chart height={150}>
	{#snippet children({ context })}
		<Layer>
			<Polygon
				cx={context.width / 2}
				cy={context.height / 2}
				r={60}
				points={4}
				scaleX={0.5}
				{rotate}
				{cornerRadius}
			/>
		</Layer>
	{/snippet}
</Chart>
