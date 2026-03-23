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
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());
	export { data };

	let xDomain = $state<DomainType>([null, null]);
</script>

<Chart
	{data}
	x="date"
	{xDomain}
	y="value"
	yDomain={[0, null]}
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	brush={{
		onBrushEnd: (e) => {
			xDomain = e.brush.x;
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
