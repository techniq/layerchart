<script lang="ts">
	import { Chart, Group, Layer, Polygon } from 'layerchart';
	import PolygonControls from '$lib/components/controls/PolygonControls.svelte';

	let cornerRadius = $state(0);

	const data = undefined;
	export { data };
</script>

<PolygonControls bind:cornerRadius />

<Chart height={150}>
	{#snippet children({ context })}
		<Layer>
			<Group x={context.width / 2} y={context.height / 2}>
				{@const size = 50}
				<Polygon
					points={[
						{ x: -size, y: -size / 3 },
						{ x: -size / 3, y: -size / 3 },
						{ x: -size / 3, y: -size },
						{ x: size / 3, y: -size },
						{ x: size / 3, y: -size / 3 },
						{ x: size, y: -size / 3 },
						{ x: size, y: size / 3 },
						{ x: size / 3, y: size / 3 },
						{ x: size / 3, y: size },
						{ x: -size / 3, y: size },
						{ x: -size / 3, y: size / 3 },
						{ x: -size, y: size / 3 }
					]}
					{cornerRadius}
				/>
			</Group>
		</Layer>
	{/snippet}
</Chart>
