<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import {
		Area,
		Axis,
		Chart,
		ChartClipPath,
		Layer,
		LinearGradient,
		defaultChartPadding,
		type DomainType
	} from 'layerchart';

	export { data };

	let yDomain = $state<DomainType>([null, null]);
</script>

<Chart
	{data}
	x="date"
	y="value"
	{yDomain}
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	brush={{
		axis: 'y',
		onBrushEnd: (e) => {
			yDomain = e.brush.y;
			e.brush.reset();
		}
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<ChartClipPath>
			<LinearGradient class="from-primary/50 to-primary/1" vertical>
				{#snippet children({ gradient })}
					<Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
				{/snippet}
			</LinearGradient>
		</ChartClipPath>
	</Layer>
</Chart>
