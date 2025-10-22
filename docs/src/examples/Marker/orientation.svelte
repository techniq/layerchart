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

<div class="grid gap-2">
	<div>default (auto)</div>
	<Chart {data} x="x" y="y" height={200}>
		<Layer>
			<Spline
				{curve}
				class="stroke-primary stroke-2"
				marker={{ type: 'line', class: 'stroke-2 stroke-accent' }}
			/>
		</Layer>
	</Chart>

	<div>0</div>
	<Chart {data} x="x" y="y" height={200}>
		<Layer>
			<Spline
				{curve}
				class="stroke-primary stroke-2"
				marker={{ type: 'line', orient: 0, class: 'stroke-2 stroke-accent' }}
			/>
		</Layer>
	</Chart>

	<div>90</div>
	<Chart {data} x="x" y="y" height={200}>
		<Layer>
			<Spline
				{curve}
				class="stroke-primary stroke-2"
				marker={{ type: 'line', orient: 90, class: 'stroke-2 stroke-accent' }}
			/>
		</Layer>
	</Chart>
</div>
