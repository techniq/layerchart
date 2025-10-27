<script lang="ts">
	import { Axis, Chart, Highlight, Layer, Points, Rule, Tooltip } from 'layerchart';
	import { sort } from '@layerstack/utils';
	import { getAlphabet } from '$lib/data.remote';

	const alphabetData = await getAlphabet();
	const data = $state(sort(alphabetData, (d) => d.letter));

	export { data };
</script>

<Chart
	{data}
	x="letter"
	y="frequency"
	yNice
	padding={{ left: 20, bottom: 32 }}
	tooltip={{ mode: 'band' }}
	height={400}
>
	<Layer>
		<Axis placement="left" grid rule format="percentRound" />
		<Axis placement="bottom" rule />
		<Rule />
		<Points />
		<Highlight area />
	</Layer>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.letter} />
			<Tooltip.List>
				<Tooltip.Item label="Frequency" value={data.frequency} format="percent" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
