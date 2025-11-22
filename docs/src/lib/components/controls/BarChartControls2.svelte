<script lang="ts">
	import { NumberStepper, MenuField } from 'svelte-ux';
	import {
		randomNormal,
		randomUniform,
		randomInt,
		randomLogNormal,
		randomExponential,
		randomBates
	} from 'd3-random';

	interface Props {
		random: () => number;
		selectedGenerator: string;
		randomCount: number;
	}

	let {
		random = $bindable(),
		selectedGenerator = $bindable(),
		randomCount = $bindable()
	}: Props = $props();
</script>

<div class="grid grid-cols-[1fr_148px] gap-2 my-2">
	<MenuField
		label="Generator"
		options={[
			{
				label: 'normal',
				value: 'normal'
			},
			{
				label: 'uniform',
				value: 'uniform'
			},
			{
				label: 'integer',
				value: 'integer'
			},
			{
				label: 'logNormal',
				value: 'logNormal'
			},
			{
				label: 'exponential',
				value: 'exponential'
			},
			{
				label: 'bates',
				value: 'bates'
			}
		]}
		bind:value={selectedGenerator}
		on:change={(e) => {
			switch (e.detail.value) {
				case 'normal':
					random = randomNormal();
					break;
				case 'uniform':
					random = randomUniform();
					break;
				case 'integer':
					random = randomInt(1, 10);
					break;
				case 'logNormal':
					random = randomLogNormal();
					break;
				case 'exponential':
					random = randomExponential(10);
					break;
				case 'bates':
					random = randomBates(10);
					break;
			}
		}}
	/>

	<NumberStepper label="Count" bind:value={randomCount} class="w-full" />
</div>
