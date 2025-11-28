<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { linear } from 'svelte/easing';

	import { Axis, Chart, Circle, Layer, MotionPath, Spline } from 'layerchart';
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
		duration: '3s',
		repeatCount: undefined as number | 'indefinite' | undefined,
		start: undefined as string | undefined,
		rotate: undefined as number | 'auto' | 'auto-reverse' | undefined
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
			{#key data}
				<MotionPath
					duration={config.duration}
					{...config.repeatCount ? { repeatCount: config.repeatCount } : {}}
					{...config.start ? { begin: config.start } : {}}
					{...config.rotate ? { rotate: config.rotate } : {}}
				>
					{#snippet children({ pathId, objectId })}
						<Spline id={pathId} curve={config.curve} draw={{ duration: 3000, easing: linear }} />
						<Circle id={objectId} r={5} class="fill-surface-100 stroke-surface-content" />
					{/snippet}
				</MotionPath>
			{/key}
		{/if}
	</Layer>
</Chart>
