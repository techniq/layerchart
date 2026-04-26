<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Axis, Chart, Layer, Spline, Trail } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import TrailControls from '$lib/components/controls/TrailControls.svelte';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

	let config = $state({
		show: false,
		pathGenerator: (x: number) => x,
		amplitude: 1,
		frequency: 10,
		phase: 0,
		curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
		cap: 'round' as 'round' | 'butt',
		pointCount: 30,
		showLine: true,
		motion: 'tween' as 'tween' | 'none'
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

<TrailControls bind:config />

<Chart
	{data}
	x="x"
	y="y"
	yNice
	r="y"
	rScale={scaleLinear()}
	rRange={[2, 16]}
	padding={25}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if config.show}
			<Trail curve={config.curve} cap={config.cap} motion={config.motion} class="fill-primary" />
			{#if config.showLine}
				<Spline
					curve={config.curve}
					motion={config.motion}
					class="stroke-surface-content/30 stroke-1"
				/>
			{/if}
		{/if}
	</Layer>
</Chart>
