<script lang="ts">
	import { group } from 'd3-array';
	import { scaleOrdinal } from 'd3-scale';
	import { curveLinearClosed } from 'd3-shape';
	import { Axis, Chart, Hull, Layer, Points } from 'layerchart';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import { getGroupData } from '$lib/data.remote';

	let data = $state(await getGroupData());
	let curve = $state(curveLinearClosed);

	const groupColor = scaleOrdinal([
		'var(--color-info)',
		'var(--color-warning)',
		'var(--color-danger)'
	]);

	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-4">
	<CurveMenuField bind:value={curve} showOpenClosed />
</div>

<Chart
	{data}
	x="x"
	xNice
	xPadding={[10, 10]}
	y="y"
	yPadding={[10, 10]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	height={300}
>
	{@const dataByGroup = group(data, (d: any) => d.group)}
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#each dataByGroup as [group, data]}
			{@const color = groupColor(group)}
			<Points r={3} {data} fill={color} />
			<!-- TODO: handle group color differently to work with Canvas -->
			<Hull
				{data}
				{curve}
				style="--group-color:{color}"
				classes={{
					path: 'pointer-events-none stroke-[var(--group-color)] fill-[var(--group-color)] [fill-opacity:0.1]'
				}}
			/>
		{/each}
	</Layer>
</Chart>
