<script lang="ts">
	import type { ComponentProps } from 'svelte';

	import { Axis, Chart, Layer, MotionPath, Spline } from 'layerchart';

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
			<MotionPath duration="5s" repeatCount="indefinite" rotate="auto">
				{#snippet children({ pathId, objectId })}
					<Spline id={pathId} {curve} />
					<g id={objectId} fill="white" transform="translate(-28, -28)">
						<path
							d="M 54.4141 28 C 54.3906 25.2578 50.6639 23.2656 46.1874 23.2656 L 36.7421 23.2656 C 35.4296 23.2656 34.9374 23.0547 34.1640 22.1641 L 18.4140 4.9844 C 17.9218 4.4219 17.3124 4.1406 16.6093 4.1406 L 13.8905 4.1406 C 13.2812 4.1406 12.9296 4.6797 13.2343 5.3359 L 21.3437 23.2656 L 9.4374 24.6250 L 5.1952 16.8437 C 4.8905 16.2578 4.3749 16 3.6015 16 L 2.5937 16 C 1.9843 16 1.5859 16.3984 1.5859 17.0078 L 1.5859 38.9922 C 1.5859 39.6016 1.9843 39.9766 2.5937 39.9766 L 3.6015 39.9766 C 4.3749 39.9766 4.8905 39.7188 5.1952 39.1563 L 9.4374 31.3750 L 21.3437 32.7344 L 13.2343 50.6641 C 12.9296 51.2968 13.2812 51.8594 13.8905 51.8594 L 16.6093 51.8594 C 17.3124 51.8594 17.9218 51.5547 18.4140 51.0156 L 34.1640 33.8125 C 34.9374 32.9453 35.4296 32.7344 36.7421 32.7344 L 46.1874 32.7344 C 50.6639 32.7344 54.3906 30.7188 54.4141 28 Z"
						/>
					</g>
				{/snippet}
			</MotionPath>
		{/if}
	</Layer>
</Chart>
