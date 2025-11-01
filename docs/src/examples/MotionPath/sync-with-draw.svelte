<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { linear } from 'svelte/easing';

	import { Axis, Chart, Circle, Layer, MotionPath, Spline } from 'layerchart';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import MotionPathControls from '$lib/components/MotionPathControls.svelte';

	let pointCount = $state(100);
	let pathGenerator = $state((x: number) => x);
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);
	let amplitude = $state(1);
	let frequency = $state(10);
	let phase = $state(0);
	let show = $state(true);

	const data = $derived(
		Array.from({ length: pointCount }).map((_, i) => {
			return {
				x: i + 1,
				y: pathGenerator(i / pointCount) ?? i
			};
		})
	);

	export { data };
</script>

<MotionPathControls
	bind:show
	bind:pathGenerator
	bind:amplitude
	bind:frequency
	bind:phase
	bind:curve
	bind:pointCount
/>
<Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			{#key data}
				<MotionPath duration="3s">
					{#snippet children({ pathId, objectId })}
						<Spline id={pathId} {curve} draw={{ duration: 3000, easing: linear }} />
						<Circle id={objectId} r={5} class="fill-surface-100 stroke-surface-content" />
					{/snippet}
				</MotionPath>
			{/key}
		{/if}
	</Layer>
</Chart>
