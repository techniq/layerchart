<script lang="ts">
	import { NumberStepper, MenuField, RangeField } from 'svelte-ux';
	import { timeDay, timeWeek, timeMonth } from 'd3-time';
	import { cls } from '@layerstack/tailwind';

	interface Props {
		dateRange?: number;
		thresholds?: number;
		interval?: typeof timeDay.range;
	}

	let {
		dateRange = $bindable(),
		thresholds = $bindable(),
		interval = $bindable()
	}: Props = $props();
</script>

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
