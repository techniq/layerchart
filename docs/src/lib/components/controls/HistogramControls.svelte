<script lang="ts">
	import { NumberStepper, MenuField, RangeField } from 'svelte-ux';
	import { timeDay, timeWeek, timeMonth } from 'd3-time';
	import {
		randomNormal,
		randomUniform,
		randomInt,
		randomLogNormal,
		randomExponential,
		randomBates
	} from 'd3-random';
	import { cls } from '@layerstack/tailwind';

	interface Props {
		dateRange?: number;
		thresholds?: number;
		interval?: typeof timeDay.range;
		random?: () => number;
		selectedGenerator?: string;
		randomCount?: number;
	}

	let {
		dateRange = $bindable(),
		thresholds = $bindable(),
		interval = $bindable(),
		random = $bindable(),
		selectedGenerator = $bindable(),
		randomCount = $bindable()
	}: Props = $props();
</script>

{#if dateRange !== undefined || thresholds !== undefined || interval !== undefined}
	<div class={cls('flex gap-2 mb-4 screenshot-hidden')}>
		{#if dateRange !== undefined}
			<NumberStepper label="Date range" bind:value={dateRange} min={1} class="w-40" />
		{/if}
		{#if thresholds !== undefined}
			<RangeField label="Thresholds" bind:value={thresholds} min={0} max={100} class="grow" />
		{/if}
		{#if interval !== undefined}
			<MenuField
				label="Interval"
				options={[
					{ label: 'Days', value: timeDay.range },
					{ label: 'Weeks', value: timeWeek.range },
					{ label: 'Months', value: timeMonth.range }
				]}
				bind:value={interval}
				stepper
				classes={{ menuIcon: 'hidden' }}
			/>
		{/if}
	</div>
{/if}

{#if selectedGenerator !== undefined || randomCount !== undefined}
	<div class={cls('grid grid-cols-[1fr_148px] gap-2 my-2 screenshot-hidden')}>
		{#if selectedGenerator !== undefined}
			<MenuField
				label="Generator"
				options={[
					{ label: 'normal', value: 'normal' },
					{ label: 'uniform', value: 'uniform' },
					{ label: 'integer', value: 'integer' },
					{ label: 'logNormal', value: 'logNormal' },
					{ label: 'exponential', value: 'exponential' },
					{ label: 'bates', value: 'bates' }
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
		{/if}

		{#if randomCount !== undefined}
			<NumberStepper label="Count" bind:value={randomCount} class="w-full" />
		{/if}
	</div>
{/if}
