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

	let xDomain = $state<DomainType>([null, null]);
</script>

<Chart
	{data}
	x="date"
	{xDomain}
	y="value"
	yDomain={[0, null]}
	padding={{ left: 16, bottom: 24 }}
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

<Chart
	{data}
	x="date"
	y="value"
	padding={{ left: 16 }}
	brush={{
		onChange: (e) => {
			xDomain = e.xDomain;
		}
	}}
	height={40}
>
	<Layer>
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
	</Layer>
</Chart>
