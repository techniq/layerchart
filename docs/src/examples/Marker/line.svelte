<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Chart, Line, Layer } from 'layerchart';
	import { Field, Switch } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	let pathGenerator = $state((x: number) => x);
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

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

<div class="grid grid-cols-[60px_60px] gap-2 mb-2 lc-example-controls">
	<Field label="Start" let:id>
		<Switch bind:checked={markerStart} {id} size="md" />
	</Field>
	<Field label="End" let:id>
		<Switch bind:checked={markerEnd} {id} size="md" />
	</Field>
</div>

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
