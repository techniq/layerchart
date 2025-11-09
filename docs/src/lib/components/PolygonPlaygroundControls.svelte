<script lang="ts">
	import { RangeField } from 'svelte-ux';

	// <PolygonPlaygroundControls bind:config />

	interface PolygonPlaygroundConfig {
		points: number;
		cornerRadius: number;
		inset: number;
		rotate: number;
		scaleX: number;
		scaleY: number;
		skewX: number;
		skewY: number;
		tiltX: number;
		tiltY: number;
	}

	interface Props {
		config: PolygonPlaygroundConfig;
	}

	let {
		config = $bindable({
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
		})
	}: Props = $props();
</script>

<div class="grid grid-cols-xs gap-2 mb-2 lc-example-controls">
	<RangeField label="points" bind:value={config.points} min={3} max={20} />
	<RangeField
		label="inset"
		bind:value={config.inset}
		min={-1}
		max={1}
		step={0.1}
		format="decimal"
	/>
	<RangeField label="rotate" bind:value={config.rotate} max={360} />
	<RangeField label="cornerRadius" bind:value={config.cornerRadius} max={50} />
	<RangeField
		label="scaleX"
		bind:value={config.scaleX}
		min={-2}
		max={2}
		step={0.1}
		format="decimal"
	/>
	<RangeField
		label="scaleY"
		bind:value={config.scaleY}
		min={-2}
		max={2}
		step={0.1}
		format="decimal"
	/>
	<RangeField label="skewX" bind:value={config.skewX} min={-50} max={50} />
	<RangeField label="skewY" bind:value={config.skewY} min={-50} max={50} />
	<RangeField
		label="tiltX"
		bind:value={config.tiltX}
		min={-2}
		max={2}
		step={0.1}
		format="decimal"
	/>
	<RangeField
		label="tiltY"
		bind:value={config.tiltY}
		min={-2}
		max={2}
		step={0.1}
		format="decimal"
	/>
</div>
