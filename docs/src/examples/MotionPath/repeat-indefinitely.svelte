<script lang="ts">
	import type { ComponentProps } from 'svelte';

	import { Axis, Chart, Layer, MotionPath, Polygon, Spline } from 'layerchart';

	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
	import MotionPathControls from '$lib/components/controls/MotionPathControls.svelte';

	let config = $state({
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
	});

	const data = $derived(
		Array.from({ length: config.pointCount }).map((_, i) => {
			return {
				x: i + 1,
				y: config.pathGenerator(i / config.pointCount) ?? i
			};
		})
	);

	export { data };
</script>

<MotionPathControls bind:config />

<Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if config.show}
			<MotionPath
				duration={config.duration}
				repeatCount={config.repeatCount}
				{...config.start ? { begin: config.start } : {}}
			>
				{#snippet children({ pathId, objectId })}
					<Spline id={pathId} curve={config.curve} />
					<Polygon
						id={objectId}
						r={10}
						points={3}
						class="stroke-surface-content fill-surface-100"
					/>
				{/snippet}
			</MotionPath>
		{/if}
	</Layer>
</Chart>
