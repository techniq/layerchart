<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Chart, Spline, Layer } from 'layerchart';
	import MarkerControls2 from '$lib/components/MarkerControls2.svelte';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	let config = $state({
		show: true,
		tweened: true,
		pathGenerator: (x: number) => x,
		curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
		pointCount: 10,
		amplitude: 1,
		frequency: 10,
		phase: 0
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

<MarkerControls2 bind:config />
<Chart {data} x="x" y="y" height={200}>
	<Layer>
		{#if config.show}
			<Spline
				curve={config.curve}
				class="stroke-primary stroke-2"
				markerStart={{ type: 'circle', size: 20, class: 'stroke-2 fill-secondary' }}
				markerMid={{ type: 'line', class: 'stroke-2 stroke-accent' }}
				markerEnd={{
					type: 'triangle',
					size: 20,
					class: 'stroke-2 stroke-surface-100 fill-secondary'
				}}
				motion={config.tweened ? 'tween' : 'none'}
			/>
		{/if}
	</Layer>
</Chart>
