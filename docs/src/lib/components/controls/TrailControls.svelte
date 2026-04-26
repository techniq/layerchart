<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, MenuField, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';
	import ShowField from './fields/ShowField.svelte';

	interface TrailPlaygroundConfig {
		show: boolean;
		pathGenerator: (x: number) => number;
		amplitude: number;
		frequency: number;
		phase: number;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		cap: 'round' | 'butt';
		pointCount: number;
		showLine?: boolean;
		motion?: 'tween' | 'none';
	}

	interface Props {
		config?: TrailPlaygroundConfig;
	}

	let {
		config = $bindable({
			show: false,
			pathGenerator: (x: number) => x,
			amplitude: 1,
			frequency: 10,
			phase: 0,
			curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
			cap: 'round' as 'round' | 'butt',
			pointCount: 30,
			showLine: false,
			motion: undefined as 'tween' | 'none' | undefined
		})
	}: Props = $props();
</script>

<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 screenshot-hidden">
	<!-- <Field label="Show" let:id>
		<Switch checked={config.show} on:change={() => (config.show = !config.show)} {id} size="md" />
	</Field> -->
	<ShowField bind:show={config.show} inline />
	<PathDataMenuField
		bind:value={config.pathGenerator}
		amplitude={config.amplitude}
		frequency={config.frequency}
		phase={config.phase}
	/>
	<CurveMenuField bind:value={config.curve} />
	<MenuField
		label="Cap"
		options={[
			{ label: 'round', value: 'round' },
			{ label: 'butt', value: 'butt' }
		]}
		bind:value={config.cap}
		stepper
		classes={{ menuIcon: 'hidden' }}
	/>
	{#if config.motion !== undefined}
		<Field label="Show line" let:id>
			<Switch bind:checked={config.showLine} {id} size="md" />
		</Field>
		<RangeField label="Points" bind:value={config.pointCount} min={2} />
		<Field label="Motion" classes={{ input: 'mt-1 mb-[6px]' }}>
			<ToggleGroup bind:value={config.motion} variant="outline" size="sm">
				<ToggleOption value="none">none</ToggleOption>
				<ToggleOption value="tween">tween</ToggleOption>
			</ToggleGroup>
		</Field>
	{/if}
</div>
