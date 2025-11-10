<script lang="ts">
	import { Chart, Line, Layer } from 'layerchart';
	import StartEndControls from '$lib/components/StartEndControls.svelte';

	let pathGenerator = $state((x: number) => x);
	let pointCount = $state(10);
	let markerStart = $state(true);
	let markerMid = $state(false);
	let markerEnd = $state(true);

	const data = $derived(
		Array.from({ length: pointCount }).map((_, i) => {
			return {
				x: i + 1,
				y: pathGenerator(i / pointCount) ?? i
			};
		})
	);

	const markerTypes = ['arrow', 'triangle', 'dot', 'circle', 'circle-stroke', 'line'] as const;
	export { data };
</script>

<StartEndControls bind:markerStart bind:markerEnd />

<div class="grid gap-2">
	{#each markerTypes as marker}
		<div>{marker}</div>
		<Chart {data} x="x" y="y" height={35}>
			{#snippet children({ context })}
				<Layer>
					<Line
						x1={0}
						x2={context.width}
						y1={0}
						y2={0}
						class="stroke-primary"
						markerStart={markerStart ? marker : undefined}
						markerMid={markerMid ? marker : undefined}
						markerEnd={markerEnd ? marker : undefined}
					/>
				</Layer>
			{/snippet}
		</Chart>
	{/each}
</div>
