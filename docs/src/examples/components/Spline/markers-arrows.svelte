<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Axis, Chart, Layer, Spline } from 'layerchart';
	import SplineControls from '$lib/components/controls/SplineControls.svelte';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

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
			<Spline
				curve={config.curve}
				class="stroke-primary stroke-2"
				markerStart="circle"
				markerEnd={{ type: 'arrow', class: 'stroke-2' }}
			/>
		{/if}
	</Layer>
</Chart>
