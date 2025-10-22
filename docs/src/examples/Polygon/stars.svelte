<script lang="ts">
	import { Chart, Layer, Polygon } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	let starInset = $state(0.7);
	let rotate = $state(0);
	let cornerRadius = $state(0);
</script>

<div class="flex gap-2 mb-2">
	<RangeField
		label="inset"
		labelPlacement="left"
		bind:value={starInset}
		min={-1}
		max={1}
		step={0.1}
		format="decimal"
	/>
	<RangeField label="rotate" labelPlacement="left" bind:value={rotate} max={360} />
	<RangeField label="cornerRadius" labelPlacement="left" bind:value={cornerRadius} max={50} />
</div>

<div class="grid grid-cols-sm gap-3">
	{#each [6, 8, 10, 12, 14, 16, 18, 20] as points}
		<div>
			<h3>{points} point</h3>
			<Chart height={150}>
				{#snippet children({ context })}
					<Layer>
						<Polygon
							cx={context.width / 2}
							cy={context.height / 2}
							r={50}
							{points}
							inset={starInset}
							{rotate}
							{cornerRadius}
						/>
					</Layer>
				{/snippet}
			</Chart>
		</div>
	{/each}
</div>
