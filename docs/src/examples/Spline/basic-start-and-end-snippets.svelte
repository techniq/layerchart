<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Axis, Chart, Layer, Spline, Circle } from 'layerchart';
	import SplineControls from '$lib/components/SplineControls.svelte';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	let config = $state({
		show: true,
		pointCount: 100,
		amplitude: 1,
		frequency: 10,
		phase: 0,
		curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
		pathGenerator: (x: number) => x
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

<SplineControls bind:config />
<Chart {data} x="x" y="y" yNice padding={25} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if config.show}
			<Spline curve={config.curve} class="stroke-primary stroke-2">
				{#snippet startContent()}
					<Circle r={5} class="fill-primary" />
				{/snippet}
				{#snippet endContent()}
					<Circle r={5} class="fill-primary" />
				{/snippet}
			</Spline>
		{/if}
	</Layer>
</Chart>
