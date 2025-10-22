<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Chart, Spline, Layer } from 'layerchart';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	let pathGenerator = $state((x: number) => x);
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

	let pointCount = $state(10);

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

<Chart {data} x="x" y="y" height={200}>
	<Layer>
		<Spline
			{curve}
			class="stroke-primary stroke-2"
			markerStart={{ type: 'circle', size: 20, class: 'stroke-2 fill-secondary' }}
			markerMid={{ type: 'line', class: 'stroke-2 stroke-accent' }}
			markerEnd={{
				type: 'triangle',
				size: 20,
				class: 'stroke-2 stroke-surface-100 fill-secondary'
			}}
		/>
	</Layer>
</Chart>
