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

	let yDomain = $state<DomainType>([null, null]);
</script>

<div class="border rounded-sm p-4 grid gap-1">
	<Chart
		{data}
		x="date"
		y="value"
		{yDomain}
		padding={{ left: 16, bottom: 24 }}
		brush={{
			axis: 'y',
			resetOnEnd: true,
			onBrushEnd: (e) => {
				yDomain = e.yDomain;
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
</div>
