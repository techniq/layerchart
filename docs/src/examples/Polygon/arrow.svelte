<script lang="ts">
	import { Chart, Group, Layer, Polygon } from 'layerchart';
	import PolygonControls from '$lib/components/PolygonControls.svelte';

	let cornerRadius = $state(0);

	const data = undefined;
	export { data };
</script>

<PolygonControls bind:cornerRadius includeRotate={false} />
<Chart height={150}>
	{#snippet children({ context })}
		<Layer>
			<Group x={context.width / 2} y={context.height / 2}>
				{@const size = 60}
				<Polygon
					points={[
						{ x: size, y: 0 },
						{ x: size / 4, y: -size / 2 },
						{ x: size / 4, y: -size / 4 },
						{ x: -size, y: -size / 4 },
						{ x: -size, y: size / 4 },
						{ x: size / 4, y: size / 4 },
						{ x: size / 4, y: size / 2 },
						{ x: size, y: 0 }
					]}
					{cornerRadius}
				/>
			</Group>
		</Layer>
	{/snippet}
</Chart>
