<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';

	interface SplinePlaygroundConfig {
		show: boolean;
		pathGenerator: (x: number) => number;
		amplitude: number;
		frequency: number;
		phase: number;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		pointCount: number;
		showPoints?: boolean;
		motion?: undefined | 'draw' | 'tween' | 'none';
	}

	interface Props {
		config?: SplinePlaygroundConfig;
	}

	let {
		config = $bindable({
			show: true,
			pathGenerator: (x: number) => x,
			amplitude: 1,
			frequency: 10,
			phase: 0,
			curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
			pointCount: 100,
			showPoints: false,
			motion: undefined as undefined | 'draw' | 'tween' | 'none'
		})
	}: Props = $props();
</script>

<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 screenshot-hidden">
	<Field label="Show" let:id>
		<Switch checked={config.show} on:change={() => (config.show = !config.show)} {id} size="md" />
	</Field>
	<PathDataMenuField
		bind:value={config.pathGenerator}
		amplitude={config.amplitude}
		frequency={config.frequency}
		phase={config.phase}
	/>
	<CurveMenuField bind:value={config.curve} />
	<RangeField label="Points" bind:value={config.pointCount} min={2} />
	{#if config.motion !== undefined}
		<Field label="Show points" let:id>
			<Switch bind:checked={config.showPoints} {id} size="md" />
		</Field>
		<Field label="Motion" classes={{ input: 'mt-1 mb-[6px]' }}>
			<ToggleGroup bind:value={config.motion} variant="outline" size="sm">
				<ToggleOption value="tween">tween</ToggleOption>
				<ToggleOption value="draw">draw</ToggleOption>
				<ToggleOption value="none">none</ToggleOption>
			</ToggleGroup>
		</Field>
	{/if}
</div>
