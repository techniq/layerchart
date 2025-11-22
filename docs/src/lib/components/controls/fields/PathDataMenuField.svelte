<script lang="ts">
	import { onMount } from 'svelte';
	import * as easings from 'svelte/easing';
	import { MenuField } from 'svelte-ux';

	let {
		value = $bindable(),
		amplitude = 1,
		frequency = 10,
		phase = 0
	}: {
		value?: any;
		amplitude?: number;
		frequency?: number;
		phase?: number;
	} = $props();

	const mathOptions = $derived([
		{
			label: 'sin',
			group: 'math',
			value: (x: number) => amplitude * Math.sin(x * frequency) + phase
		},
		{
			label: 'cos',
			group: 'math',
			value: (x: number) => amplitude * Math.cos(x * frequency) + phase
		},
		{
			label: 'tan',
			group: 'math',
			value: (x: number) => amplitude * Math.tan(x * frequency) + phase
		},
		{
			label: 'sqrt',
			group: 'math',
			value: (x: number) => amplitude * Math.sqrt(x * frequency) + phase
		},
		{
			label: 'ceil',
			group: 'math',
			value: (x: number) => amplitude * Math.ceil(x * frequency) + phase
		},
		{
			label: 'floor',
			group: 'math',
			value: (x: number) => amplitude * Math.floor(x * frequency) + phase
		},
		{
			label: 'round',
			group: 'math',
			value: (x: number) => amplitude * Math.round(x * frequency) + phase
		},
		{ label: 'random', group: 'math', value: (x: number) => amplitude * Math.random() + phase },
		{
			label: 'pow',
			group: 'math',
			value: (x: number) => amplitude * Math.pow(x, frequency) + phase
		}
	]);

	const easingOptions = Object.entries(easings).map(([key, value]) => {
		return {
			label: key,
			value,
			group: 'easing'
		};
	});

	const options = $derived([...mathOptions, ...easingOptions]);

	// Select initial option
	onMount(() => {
		value = options[0].value;
	});
</script>

<div class="screenshot-hidden">
	<MenuField label="Path data" {options} bind:value stepper classes={{ menuIcon: 'hidden' }} />
</div>
