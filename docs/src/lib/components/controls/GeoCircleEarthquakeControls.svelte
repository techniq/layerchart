<script lang="ts">
	import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
	import type { TimerState } from '@layerstack/svelte-state';

	interface Props {
		timer: TimerState;
		velocity?: number;
	}

	let { timer, velocity = $bindable(3) }: Props = $props();
</script>

<div class="flex gap-2 items-end mb-4 screenshot-hidden">
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
