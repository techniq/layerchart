<script lang="ts">
	import { Area, Axis, Chart, Layer, LinearGradient, type DomainType } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();
	export { data };

	let xDomain = $state<DomainType>([null, null]);
</script>

<Chart
	data={data.filter(
		(d: any) =>
			(xDomain?.[0] == null || d.date >= xDomain?.[0]) &&
			(xDomain?.[1] == null || d.date <= xDomain?.[1])
	)}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={{ left: 16, bottom: 24 }}
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
