<script lang="ts">
	import { Field, RangeField, Switch, TextField } from 'svelte-ux';

	// <ArcPlaygroundControls bind:config />

	interface ArcPlaygroundConfig {
		show: boolean;
		value: number;
		spring: boolean;
		domain: [number, number];
		range: [number, number];
		innerRadius: number;
		outerRadius: number;
		cornerRadius: number;
		padAngle: number;
		outerText: string;
		innerText: string;
		centroidText: string;
		textSize: number;
	}

	interface Props {
		config: ArcPlaygroundConfig;
	}

	let {
		config = $bindable({
			show: true,
			value: 60,
			spring: true,
			domain: [0, 100] as [number, number],
			range: [-90, 90] as [number, number],
			innerRadius: 70,
			outerRadius: 140,
			cornerRadius: 8,
			padAngle: 0,
			outerText: 'outer text',
			innerText: 'inner text',
			centroidText: 'centroid text',
			textSize: 16
		})
	}: Props = $props();
</script>

<div class="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 mb-2 lc-example-controls">
	<RangeField
		label="Value"
		bind:value={config.value}
		min={config.domain[0]}
		max={config.domain[1]}
		class="col-span-2"
	/>
	<Field label="Show" let:id>
		<Switch bind:checked={config.show} {id} />
	</Field>
	<Field label="Use spring" let:id>
		<Switch bind:checked={config.spring} {id} />
	</Field>
	<RangeField label="Domain Min" bind:value={config.domain[0]} max={config.domain[1]} />
	<RangeField label="Domain Max" bind:value={config.domain[1]} max={1000} />
	<RangeField label="Range Min (degrees)" bind:value={config.range[0]} min={-360} max={360} />
	<RangeField label="Range Max (degrees)" bind:value={config.range[1]} min={-360} max={360} />
	<RangeField label="Inner radius" bind:value={config.innerRadius} max={config.outerRadius} />
	<RangeField
		label="Outer radius"
		bind:value={config.outerRadius}
		min={config.innerRadius}
		max={200}
	/>
	<RangeField
		label="Corner radius"
		bind:value={config.cornerRadius}
		max={(config.outerRadius - config.innerRadius) / 2}
	/>
	<RangeField label="Pad angle" bind:value={config.padAngle} max={2} step={0.1} />
	<!-- <RangeField label="Pad radius" bind:value={padRadius} max={2} step={0.1} /> -->
	<TextField label="Outer Arc Text" bind:value={config.outerText} />
	<TextField label="Inner Arc Text" bind:value={config.innerText} />
	<TextField label="Centroid Arc Text" bind:value={config.centroidText} />
	<RangeField
		label="Font size (px)"
		bind:value={config.textSize}
		min={config.domain[0]}
		max={config.domain[1]}
	/>
</div>
