<script lang="ts">
	import { LineChart } from 'layerchart';
	import { Button, ButtonGroup, Field, TextField, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { format } from '@layerstack/utils';
	import { AnimationFrames } from 'runed';

	let motion = $state(true);
	let show = $state(true);

	let pointsPerFrame = $state(10);
	let maxLength = $state(1000);
	let chartData = $state<{ date: Date; value: number }[]>([]);

	function generateDataPoint(
		referenceDate: Date,
		valueRange: [number, number]
	): { date: Date; value: number } {
		const value = Math.floor(Math.random() * (valueRange[1] - valueRange[0] + 1)) + valueRange[0];
		return {
			date: new Date(referenceDate),
			value: isFinite(value) ? value : valueRange[0]
		};
	}

	function generateDataPoints(
		count: number,
		startDate: Date,
		dayIncrement: number,
		valueRange: [number, number]
	): { date: Date; value: number }[] {
		const points: { date: Date; value: number }[] = [];
		for (let i = 0; i < count; i++) {
			const date = new Date(startDate.getTime() + i * dayIncrement * 24 * 60 * 60 * 1000);
			if (isNaN(date.getTime())) continue;
			points.push(generateDataPoint(date, valueRange));
		}
		return points;
	}

	const animation = new AnimationFrames(
		() => {
			// Get the latest date from the current data or use the last sample date
			const latestDate =
				chartData.length > 0
					? chartData[chartData.length - 1].date
					: new Date('2025-04-07T22:00:00.000Z');
			let nextDate = new Date(latestDate.getTime() + 24 * 60 * 60 * 1000); // Start from the next day

			const newPoints = generateDataPoints(pointsPerFrame, nextDate, 1, [0, 100]);

			// Check if we're at or over capacity
			if (chartData.length + newPoints.length > maxLength) {
				// Remove old points and add new points in one operation to maintain buffer size
				chartData = [...chartData.slice(-(maxLength - newPoints.length)), ...newPoints];
			} else {
				// Just push new points
				chartData.push(...newPoints);
			}

			nextDate = new Date(nextDate.getTime() + pointsPerFrame * 24 * 60 * 60 * 1000);
		},
		{ fpsLimit: () => 30, immediate: false }
	);

	function loadRandomData() {
		const latestDate =
			chartData.length > 0
				? chartData[chartData.length - 1].date
				: new Date('2025-04-07T22:00:00.000Z');
		let nextDate = new Date(latestDate.getTime() + 24 * 60 * 60 * 1000); // Start from the next day
		const newPoints = generateDataPoints(pointsPerFrame, nextDate, 1, [0, 100]);

		// mutate in place
		chartData.splice(0, Math.max(0, chartData.length + newPoints.length - maxLength));
		chartData.push(...newPoints);
		chartData = chartData;
	}

	// Clear all data
	function clearData() {
		animation.stop();
		chartData = [];
	}
</script>

<div class="grid gap-4">
	<div class="flex gap-3">
		<Field label="Motion">
			<ToggleGroup bind:value={motion} variant="outline">
				<ToggleOption value={true}>Yes</ToggleOption>
				<ToggleOption value={false}>No</ToggleOption>
			</ToggleGroup>
		</Field>

		<Field label="Show">
			<ToggleGroup bind:value={show} variant="outline">
				<ToggleOption value={true}>Yes</ToggleOption>
				<ToggleOption value={false}>No</ToggleOption>
			</ToggleGroup>
		</Field>
	</div>

	<div class="m-2 flex items-end gap-2">
		<ButtonGroup _size="sm" variant="fill-light">
			<Button onclick={() => animation.start()} disabled={animation.running}>Start</Button>
			<Button onclick={() => animation.stop()} disabled={!animation.running}>Stop</Button>
		</ButtonGroup>
		<Button onclick={() => clearData()} variant="fill-light">Clear</Button>
		<Button onclick={() => loadRandomData()} variant="fill-light">Load more</Button>

		<TextField
			label="Frequency (Hz)"
			bind:value={pointsPerFrame}
			type="integer"
			min={1}
			step={100}
			dense
		/>
		<TextField
			label="Buffer size"
			bind:value={maxLength}
			type="integer"
			min={1}
			step={4000}
			dense
		/>
	</div>

	<div class="h-[500px] p-4 border rounded-sm">
		{#if show && chartData.length}
			<LineChart x="date" y="value" data={chartData} brush />
		{/if}
	</div>

	data: {format(chartData.length)} points
</div>
