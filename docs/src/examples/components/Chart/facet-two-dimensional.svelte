<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Circle, Frame } from 'layerchart';

	// Rows missing a measurement are dropped, but a missing `sex` is kept — it becomes the
	// rightmost column
	const data = penguins.filter((d) => d.bill_length_mm !== 'NA' && d.bill_depth_mm !== 'NA');
	export { data };
</script>

<Chart
	{data}
	x="bill_length_mm"
	y="bill_depth_mm"
	fx="sex"
	fy="species"
	fxDomain={['female', 'male', 'NA']}
	xNice
	yNice
	grid
	padding={{ left: 44, bottom: 32, top: 24, right: 72 }}
	height={480}
>
	{#snippet marks()}
		<Frame class="stroke-surface-content/20 fill-none" />
		<Circle
			cx="bill_length_mm"
			cy="bill_depth_mm"
			r={2.5}
			fill="var(--color-primary)"
			fillOpacity={0.7}
		/>
	{/snippet}
</Chart>
