<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	// <MotionPathControls bind:config />

	interface MotionPathConfig {
		pointCount: number;
		pathGenerator: (x: number) => number;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		amplitude: number;
		frequency: number;
		phase: number;
		show: boolean;
		duration: string;
		repeatCount?: number | 'indefinite';
		start?: string;
		rotate?: number | 'auto' | 'auto-reverse';
	}

	interface Props {
		config?: MotionPathConfig;
	}

	let {
		config = $bindable({
			pointCount: 100,
			pathGenerator: (x: number) => x,
			curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
			amplitude: 1,
			frequency: 10,
			phase: 0,
			show: true,
			duration: '5s',
			repeatCount: 'indefinite' as number | 'indefinite',
			start: undefined as string | undefined
		})
	}: Props = $props();
</script>

<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-4">
	<Field label="Show" let:id>
		<Switch bind:checked={config.show} {id} size="md" />
	</Field>
	<PathDataMenuField
		bind:value={config.pathGenerator}
		amplitude={config.amplitude}
		frequency={config.frequency}
		phase={config.phase}
	/>
	<CurveMenuField bind:value={config.curve} />
	<RangeField label="Points" bind:value={config.pointCount} min={2} />
</div>
