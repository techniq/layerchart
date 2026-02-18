<script lang="ts">
	import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
	import type { TimerState } from '@layerstack/svelte-state';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
	import { curveCatmullRomClosed } from 'd3-shape';

	interface Props {
		timer: TimerState;
		curve?: typeof curveCatmullRomClosed;
		minArea?: undefined | number;
		velocity?: number;
	}

	let {
		timer,
		curve = $bindable(undefined),
		minArea = $bindable(undefined),
		velocity = $bindable(3)
	}: Props = $props();
</script>

<div class="flex flex-col gap-2 mb-4 screenshot-hidden">
	{#if minArea !== undefined}
		<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2">
			<CurveMenuField bind:value={curve} showOpenClosed />
			<RangeField label="Min area" bind:value={minArea} min={0} max={3} step={0.01} />
		</div>
	{/if}
	<div class="mb-2 flex gap-6">
		<Field label="Spin:" dense labelPlacement="left" let:id>
			<ButtonGroup size="sm" variant="fill-light">
				<Button on:click={timer.start} disabled={timer.running}>Start</Button>
				<Button on:click={timer.stop} disabled={!timer.running}>Stop</Button>
			</ButtonGroup>
		</Field>

		<RangeField
			label="Velocity:"
			bind:value={velocity}
			min={-10}
			max={10}
			disabled={!timer.running}
			labelPlacement="left"
		/>
	</div>
</div>
