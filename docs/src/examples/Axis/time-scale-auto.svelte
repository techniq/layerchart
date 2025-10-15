<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
	import {
		timeDay,
		timeHour,
		timeMillisecond,
		timeMinute,
		timeMonth,
		timeSecond,
		timeYear,
		type TimeInterval
	} from 'd3-time';
	import { startOfInterval } from '@layerstack/utils';
	import type { ComponentProps } from 'svelte';
	import { RangeField } from 'svelte-ux';

	const today = startOfInterval('day', new Date());

	const examples = [
		{
			label: '5 years',
			domain: [timeYear.offset(today, -5), today],
			interval: timeYear.every(1),
			format: 'year'
		},
		{
			label: '1 year',
			domain: [timeYear.offset(today, -1), today],
			interval: timeMonth.every(1),
			format: { type: 'month', options: { variant: 'short' } }
		},
		{
			label: '6 months',
			domain: [timeMonth.offset(today, -6), today],
			interval: timeMonth.every(1),
			format: { type: 'month', options: { variant: 'short' } }
		},
		{
			label: '90 days',
			domain: [timeDay.offset(today, -90), today],
			interval: timeDay.every(7),
			format: { type: 'day', options: { variant: 'short' } }
		},
		{
			label: '30 days',
			domain: [timeDay.offset(today, -30), today],
			interval: timeDay.every(1),
			format: { type: 'day', options: { variant: 'short' } }
		},
		{
			label: '10 days',
			domain: [timeDay.offset(today, -10), today],
			interval: timeDay.every(1),
			format: { type: 'day', options: { variant: 'short' } }
		},
		{
			label: '7 days',
			domain: [timeDay.offset(today, -7), today],
			interval: timeDay.every(1),
			format: { type: 'day', options: { variant: 'short' } }
		},
		{
			label: '3 days',
			domain: [timeDay.offset(today, -3), today],
			interval: timeHour.every(4),
			format: { type: 'day', options: { variant: 'short' } }
		},
		{
			label: '24 hours',
			domain: [timeHour.offset(today, -24), today],
			interval: timeHour.every(1),
			format: 'hour'
		},
		{
			label: '12 hours',
			domain: [timeHour.offset(today, -12), today],
			interval: timeHour.every(1),
			format: 'hour'
		},
		{
			label: '1 hour',
			domain: [timeHour.offset(today, -1), today],
			interval: timeMinute.every(5),
			format: 'minute'
		},
		{
			label: '1 minute',
			domain: [timeMinute.offset(today, -1), today],
			interval: timeSecond.every(10),
			format: 'second'
		},
		{
			label: '1 second',
			domain: [timeSecond.offset(today, -1), today],
			interval: timeMillisecond.every(100),
			format: 'millisecond'
		}
	] as {
		label: string;
		domain: [Date, Date];
		interval: TimeInterval;
		format?: ComponentProps<typeof Axis>['format'];
	}[];

	let tickSpacing = $state(80); // x-axis default
</script>

<RangeField
	label="tickSpacing"
	labelPlacement="left"
	bind:value={tickSpacing}
	min={10}
	max={300}
	step={10}
	class="justify-self-end mb-2"
/>

<div class="grid gap-3">
	{#each examples as example}
		<div>
			<div class="text-sm mb-1">{example.label}</div>
			<div class="h-[100px] p-4 border rounded-sm">
				<Chart xDomain={example.domain} padding={{ top: 20, bottom: 20, left: 20, right: 20 }}>
					<Layer>
						<Axis placement="bottom" rule grid {tickSpacing} />
					</Layer>
				</Chart>
			</div>
		</div>
	{/each}
</div>
