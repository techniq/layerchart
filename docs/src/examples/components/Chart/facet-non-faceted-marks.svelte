<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Circle, Frame } from 'layerchart';

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

		<!--
			Marks read their panel's rows from context, so passing `data` explicitly opts out and
			draws the whole population in every panel — a backdrop to compare each panel against.
		-->
		<Circle
			{data}
			cx="bill_length_mm"
			cy="bill_depth_mm"
			r={1}
			fill="var(--color-surface-content)"
			fillOpacity={0.25}
		/>

		<Circle
			cx="bill_length_mm"
			cy="bill_depth_mm"
			r={2.5}
			fill="var(--color-primary)"
			fillOpacity={0.7}
		/>
	{/snippet}
</Chart>
