<script lang="ts">
	import {
		Area,
		Axis,
		Chart,
		ChartClipPath,
		Layer,
		LinearGradient,
		type DomainType
	} from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();
	export { data };

	let xDomain = $state<DomainType>([null, null]);
</script>

<Chart
	{data}
	x="date"
	{xDomain}
	y="value"
	yDomain={[0, null]}
	padding={{ left: 16, bottom: 24 }}
	brush={{
		resetOnEnd: true,
		onBrushEnd: (e) => {
			xDomain = e.xDomain;
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
