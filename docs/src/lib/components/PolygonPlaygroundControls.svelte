<script lang="ts">
	import { RangeField } from 'svelte-ux';

	// <PolygonPlaygroundControls bind:points bind:cornerRadius bind:inset bind:rotate bind:scaleX bind:scaleY bind:skewX bind:skewY bind:tiltX bind:tiltY />

	interface Props {
		points?: number;
		cornerRadius?: number;
		inset?: number;
		rotate?: number;
		scaleX?: number;
		scaleY?: number;
		skewX?: number;
		skewY?: number;
		tiltX?: number;
		tiltY?: number;
	}

	let {
		points = $bindable(8),
		cornerRadius = $bindable(0),
		inset = $bindable(0),
		rotate = $bindable(0),
		scaleX = $bindable(1),
		scaleY = $bindable(1),
		skewX = $bindable(0),
		skewY = $bindable(0),
		tiltX = $bindable(0),
		tiltY = $bindable(0)
	}: Props = $props();
</script>

<div class="grid grid-cols-xs gap-2 mb-2 lc-example-controls">
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
