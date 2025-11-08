<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Axis, Chart, Layer, Spline, Points } from 'layerchart';
	import SplineControls from '$lib/components/SplineControls.svelte';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	let config = $state({
		show: true,
		showPoints: false,
		pointCount: 100,
		pathGenerator: (x: number) => x,
		curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
		amplitude: 1,
		frequency: 10,
		phase: 0,
		motion: 'tween' as 'draw' | 'tween' | 'none'
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

<SplineControls bind:config includeShowpointsMotion={true} />
<Chart {data} x="x" y="y" yNice padding={25} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if config.show}
			<Spline
				curve={config.curve}
				motion={config.motion === 'tween' ? 'tween' : 'none'}
				draw={config.motion === 'draw'}
				class="stroke-primary stroke-2"
			/>
		{/if}
		{#if config.showPoints}
			<Points
				motion={config.motion === 'tween' ? 'tween' : 'none'}
				r={3}
				class="fill-surface-100 stroke-primary"
			/>
		{/if}
	</Layer>
</Chart>
