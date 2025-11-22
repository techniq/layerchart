<script lang="ts">
	import { Chart, Layer, Polygon } from 'layerchart';
	import PolygonControls from '$lib/components/controls/PolygonControls.svelte';

	let starInset = $state(0.7);
	let rotate = $state(0);
	let cornerRadius = $state(0);

	const data = undefined;
	export { data };
</script>

<PolygonControls bind:starInset bind:rotate bind:cornerRadius />

<Chart height={150}>
	{#snippet children({ context })}
		<Layer>
			<Polygon
				cx={context.width / 2}
				cy={context.height / 2}
				r={50}
				points={12}
				inset={starInset}
				{rotate}
				{cornerRadius}
			/>
		</Layer>
	{/snippet}
</Chart>
