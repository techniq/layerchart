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
	<div>default (auto)</div>
	<Chart {data} x="x" y="y" height={200}>
		<Layer>
			{#if config.show}
				<Spline
					curve={config.curve}
					class="stroke-primary stroke-2"
					marker={{ type: 'line', class: 'stroke-2 stroke-accent' }}
					motion={config.tweened ? 'tween' : 'none'}
				/>
			{/if}
		</Layer>
	</Chart>

	<div>0&deg;</div>
	<Chart {data} x="x" y="y" height={200}>
		<Layer>
			{#if config.show}
				<Spline
					curve={config.curve}
					class="stroke-primary stroke-2"
					marker={{ type: 'line', orient: 0, class: 'stroke-2 stroke-accent' }}
					motion={config.tweened ? 'tween' : 'none'}
				/>
			{/if}
		</Layer>
	</Chart>

	<div>90&deg;</div>
	<Chart {data} x="x" y="y" height={200}>
		<Layer>
			{#if config.show}
				<Spline
					curve={config.curve}
					class="stroke-primary stroke-2"
					marker={{ type: 'line', orient: 90, class: 'stroke-2 stroke-accent' }}
					motion={config.tweened ? 'tween' : 'none'}
				/>
			{/if}
		</Layer>
	</Chart>
</div>
