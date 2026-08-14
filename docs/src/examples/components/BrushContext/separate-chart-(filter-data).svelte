<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import {
		Area,
		Axis,
		Chart,
		Layer,
		LinearGradient,
		defaultChartPadding,
		type ChartState
	} from 'layerchart';

	export { data };

	// The lower chart owns the brush; filter the upper chart's data by its selection
	let brushChart = $state<ChartState>();
</script>

<Chart
	data={data.filter((d: any) => brushChart?.brush.contains({ x: d.date }) ?? true)}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule motion={{ type: 'tween', duration: 200 }} />
		<Axis placement="bottom" rule />
		<LinearGradient class="from-primary/50 to-primary/1" vertical>
			{#snippet children({ gradient })}
				<Area
					line={{ class: 'stroke-2 stroke-primary' }}
					fill={gradient}
					motion={{
						type: 'tween',
						duration: 200
					}}
				/>
			{/snippet}
		</LinearGradient>
	</Layer>
</Chart>

<Chart bind:context={brushChart} {data} x="date" y="value" padding={{ left: 16 }} brush height={40}>
	<Layer>
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
	</Layer>
</Chart>
