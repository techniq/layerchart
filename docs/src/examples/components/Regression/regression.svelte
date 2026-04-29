<script module lang="ts">
	import { getCarsVega } from '$lib/data.remote.js';

	const allCars = await getCarsVega();
	const data = allCars.filter((d) => d.Weight_in_lbs != null && d.Horsepower != null);
</script>

<script lang="ts">
	import { Points, ScatterChart, Tooltip } from 'layerchart';
	import Regression, { type RegressionType } from '$lib/components/Regression.svelte';
	import RegressionControls from '$lib/components/controls/RegressionControls.svelte';
	import { toTitleCase } from '@layerstack/utils';

	let type = $state<RegressionType>('linear');
	let confidence = $state<number | undefined>(0.999);
	let bandwidth = $state(0.3);
</script>

<RegressionControls bind:type bind:confidence bind:bandwidth />
<ScatterChart
	{data}
	x="Horsepower"
	y="Weight_in_lbs"
	xNice
	yNice
	padding={{ top: 8, bottom: 40, left: 52, right: 8 }}
	height={400}
	props={{
		xAxis: { label: 'Horsepower' },
		yAxis: { label: 'Weight (lbs)' },
	}}
>
	{#snippet marks()}
		<Points r={2} class="fill-primary/30 stroke-primary/50" />
		<Regression
			{type}
			{bandwidth}
			{confidence}
			stroke="var(--color-secondary)"
		/>
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{toTitleCase(data.Name)}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Horsepower (HP)" value={data.Horsepower} />
					<Tooltip.Item label="Weight (lbs)" value={data.Weight_in_lbs} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</ScatterChart>
