<script lang="ts">
	import { Chart, Layer, Polygon } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	let rotate = $state(0);
	let cornerRadius = $state(0);
</script>

<div class="flex gap-2 mb-1/2">
	<RangeField label="rotate" labelPlacement="left" bind:value={rotate} max={360} />
	<RangeField label="cornerRadius" labelPlacement="left" bind:value={cornerRadius} max={50} />
</div>
<Chart height={150}>
	{#snippet children({ context })}
		<Layer>
			<Polygon
				cx={context.width / 2}
				cy={context.height / 2}
				r={60}
				points={3}
				{rotate}
				{cornerRadius}
			/>
		</Layer>
	{/snippet}
</Chart>
