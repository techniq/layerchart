<script lang="ts">
	import { Chart, Layer, Polygon } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	let points = $state(8);
	let cornerRadius = $state(0);
	let inset = $state(0);
	let rotate = $state(0);
	let scaleX = $state(1);
	let scaleY = $state(1);
	let skewX = $state(0);
	let skewY = $state(0);
	let tiltX = $state(0);
	let tiltY = $state(0);

	const data = undefined;
	export { data };
</script>

<div class="grid grid-cols-xs gap-2 mb-2">
	<RangeField label="points" bind:value={points} min={3} max={20} />
	<RangeField label="inset" bind:value={inset} min={-1} max={1} step={0.1} format="decimal" />
	<RangeField label="rotate" bind:value={rotate} max={360} />
	<RangeField label="cornerRadius" bind:value={cornerRadius} max={50} />
	<RangeField label="scaleX" bind:value={scaleX} min={-2} max={2} step={0.1} format="decimal" />
	<RangeField label="scaleY" bind:value={scaleY} min={-2} max={2} step={0.1} format="decimal" />
	<RangeField label="skewX" bind:value={skewX} min={-50} max={50} />
	<RangeField label="skewY" bind:value={skewY} min={-50} max={50} />
	<RangeField label="tiltX" bind:value={tiltX} min={-2} max={2} step={0.1} format="decimal" />
	<RangeField label="tiltY" bind:value={tiltY} min={-2} max={2} step={0.1} format="decimal" />
</div>

<Chart height={300}>
	{#snippet children({ context })}
		<Layer>
			<Polygon
				cx={context.width / 2}
				cy={context.height / 2}
				r={100}
				{points}
				{inset}
				{rotate}
				{cornerRadius}
				{scaleX}
				{scaleY}
				{skewX}
				{skewY}
				{tiltX}
				{tiltY}
			/>
		</Layer>
	{/snippet}
</Chart>
