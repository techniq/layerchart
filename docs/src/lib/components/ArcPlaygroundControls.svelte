<script lang="ts">
	import { Field, RangeField, Switch, TextField } from 'svelte-ux';

	// <ArcPlaygroundControls bind:value bind:spring bind:domain bind:range bind:innerRadius bind:outerRadius bind:cornerRadius bind:padAngle bind:outerText bind:innerText bind:centroidText bind:textSize />

	interface Props {
		value?: number;
		spring?: boolean;
		domain?: [number, number];
		range?: [number, number];
		innerRadius?: number;
		outerRadius?: number;
		cornerRadius?: number;
		padAngle?: number;
		outerText?: string;
		innerText?: string;
		centroidText?: string;
		textSize?: number;
	}

	let {
		value = $bindable(60),
		spring = $bindable(true),
		domain = $bindable([0, 100] as [number, number]),
		range = $bindable([-90, 90] as [number, number]),
		innerRadius = $bindable(70),
		outerRadius = $bindable(140),
		cornerRadius = $bindable(8),
		padAngle = $bindable(0),
		outerText = $bindable('outer text'),
		innerText = $bindable('inner text'),
		centroidText = $bindable('centroid text'),
		textSize = $bindable(16)
	}: Props = $props();
</script>

<div class="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 mb-2 lc-example-controls">
	<RangeField label="Value" bind:value min={domain[0]} max={domain[1]} class="col-span-3" />
	<Field label="Use spring" let:id>
		<Switch bind:checked={spring} {id} />
	</Field>
	<RangeField label="Domain Min" bind:value={domain[0]} max={domain[1]} />
	<RangeField label="Domain Max" bind:value={domain[1]} max={1000} />
	<RangeField label="Range Min (degrees)" bind:value={range[0]} min={-360} max={360} />
	<RangeField label="Range Max (degrees)" bind:value={range[1]} min={-360} max={360} />
	<RangeField label="Inner radius" bind:value={innerRadius} max={outerRadius} />
	<RangeField label="Outer radius" bind:value={outerRadius} min={innerRadius} max={200} />
	<RangeField
		label="Corner radius"
		bind:value={cornerRadius}
		max={(outerRadius - innerRadius) / 2}
	/>
	<RangeField label="Pad angle" bind:value={padAngle} max={2} step={0.1} />
	<!-- <RangeField label="Pad radius" bind:value={padRadius} max={2} step={0.1} /> -->
	<TextField label="Outer Arc Text" bind:value={outerText} />
	<TextField label="Inner Arc Text" bind:value={innerText} />
	<TextField label="Centroid Arc Text" bind:value={centroidText} />
	<RangeField label="Font size (px)" bind:value={textSize} min={domain[0]} max={domain[1]} />
</div>
