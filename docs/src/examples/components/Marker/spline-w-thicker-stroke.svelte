<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Chart, Spline, Layer } from 'layerchart';
	import MarkerControls from '$lib/components/controls/MarkerControls.svelte';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

	let config = $state({
		show: true,
		tweened: true,
		markerStart: true,
		markerMid: false,
		markerEnd: true,
		pathGenerator: (x: number) => x,
		curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
		pointCount: 10,
		amplitude: 1,
		frequency: 10,
		phase: 0
	});

	const markerTypes = ['arrow', 'triangle', 'dot', 'circle', 'circle-stroke', 'line'] as const;

	const motion = $derived(config.tweened ? 'tween' : 'none');
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

<MarkerControls bind:config />

<div class="grid gap-2">
	{#each markerTypes as marker}
		<div>{marker}</div>
		<Chart {data} x="x" y="y" height={100}>
			<Layer>
				{#if config.show}
					<Spline
						curve={config.curve}
						class="stroke-primary stroke-2"
						markerStart={config.markerStart ? { type: marker, 'stroke-width': 6 } : undefined}
						markerMid={config.markerMid ? { type: marker, 'stroke-width': 6 } : undefined}
						markerEnd={config.markerEnd ? { type: marker, 'stroke-width': 6 } : undefined}
						{motion}
					/>
				{/if}
			</Layer>
		</Chart>
	{/each}
</div>
