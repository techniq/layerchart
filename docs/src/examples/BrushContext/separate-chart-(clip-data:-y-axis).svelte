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

	const data = $derived(await getAppleStock());
	export { data };

	let yDomain = $state<DomainType>([null, null]);
</script>

<div class="grid grid-cols-[40px_1fr]">
	<div>
		<Chart
			{data}
			x="date"
			y="value"
			padding={{ bottom: 24 }}
			brush={{
				axis: 'y',
				onChange: (e) => {
					yDomain = e.yDomain;
				}
			}}
			height={300}
		>
			<Layer>
				<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
			</Layer>
		</Chart>
	</div>

	<Chart {data} x="date" y="value" {yDomain} padding={{ left: 32, bottom: 24 }} height={300}>
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
