<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

	interface AreaPlaygroundConfig {
		pathGenerator: (x: number) => number;
		curve: ComponentProps<typeof CurveMenuField>['value'];
		pointCount: number;
		showPoints: boolean;
		showLine: boolean;
		show: boolean;
		tweened: boolean;
	}

	interface Props {
		config: AreaPlaygroundConfig;
		includeShowTween?: boolean;
	}

	let {
		config = $bindable({
			pathGenerator: (x: number) => x,
			curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
			pointCount: 10,
			showPoints: false,
			showLine: true,
			show: true,
			tweened: true
		}),
		includeShowTween = true
	}: Props = $props();
</script>

<div class="grid gap-2 mb-4 screenshot-hidden">
	<div class="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2">
		<PathDataMenuField bind:value={config.pathGenerator} />
		<CurveMenuField bind:value={config.curve} />
		<RangeField label="Points" bind:value={config.pointCount} min={2} />
		<Field label="Show points" let:id>
			<Switch bind:checked={config.showPoints} {id} size="md" />
		</Field>
		<Field label="Show Line" let:id>
			<Switch bind:checked={config.showLine} {id} size="md" />
		</Field>
	</div>

	{#if includeShowTween}
		<div class="grid grid-cols-[100px_auto_1fr] gap-2">
			<Field label="Show" let:id>
				<Switch bind:checked={config.show} {id} size="md" />
			</Field>

			<Field label="Tweened" let:id>
				<Switch bind:checked={config.tweened} {id} size="md" />
			</Field>
		</div>
	{/if}
</div>
