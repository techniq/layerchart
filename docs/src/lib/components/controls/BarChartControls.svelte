<script lang="ts">
	import { NumberStepper, MenuField, RangeField } from 'svelte-ux';
	import { timeDay, timeWeek, timeMonth } from 'd3-time';
	import { cls } from '@layerstack/tailwind';

	interface Props {
		dateRange?: number;
		thresholds?: number;
		intervalValue?: string;
	}

	let {
		dateRange = $bindable(),
		thresholds = $bindable(),
		intervalValue = $bindable()
	}: Props = $props();

	let intervalFunc = $state(timeWeek.range);
</script>

<div class={cls('grid gap-2 mb-4 screenshot-hidden grid-flow-col')}>
	{#if dateRange !== undefined}
		<NumberStepper label="Date range" bind:value={dateRange} class="w-full" />
	{/if}
	{#if thresholds !== undefined}
		<RangeField label="Thresholds" bind:value={thresholds} min={0} max={100} />
	{/if}
	{#if intervalValue !== undefined}
		<MenuField
			label="Interval"
			options={[
				{ label: 'Days', value: 'days', interval: timeDay.range },
				{ label: 'Weeks', value: 'weeks', interval: timeWeek.range },
				{ label: 'Months', value: 'months', interval: timeMonth.range }
			]}
			value={intervalValue}
			on:change={(e) => {
				intervalValue = e.detail.value;
				intervalFunc = e.detail.option.interval;
			}}
			stepper
			classes={{ menuIcon: 'hidden' }}
		/>
	{/if}
</div>
