<script lang="ts">
	import * as d3shapes from 'd3-shape';

	import { MenuField } from 'svelte-ux';
	import { entries } from '@layerstack/utils';
	import type { ComponentProps } from 'svelte';

	// <CurveMenuField bind:value bind:showOpenClosed />

	let {
		value = $bindable(),
		showOpenClosed = false,
		...restProps
	}: {
		value?: any;
		showOpenClosed?: boolean;
	} & ComponentProps<MenuField> = $props();

	if (value === undefined) {
		value = d3shapes['curveLinear'];
	}

	const options = entries(d3shapes)
		.filter(([key]) => {
			return (
				key.startsWith('curve') &&
				(showOpenClosed ? true : !key.endsWith('Open') && !key.endsWith('Closed')) &&
				!key.includes('Bundle') // Not compatibile with area
			);
		})
		.map(([key, value]) => {
			return {
				label: key.replace('curve', ''),
				value: value
			};
		});
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] lc-example-controls">
	<MenuField
		label="Curve"
		{options}
		bind:value
		stepper
		classes={{ menuIcon: 'hidden' }}
		{...restProps}
	/>
</div>
