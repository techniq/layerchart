<script module lang="ts">
	import { getAlphabet } from '$lib/data.remote';
	const alphabetData = await getAlphabet();
</script>

<script lang="ts">
	import { Chart, Points, Rule, Tooltip, WebGL } from '@layerchart/webgl';
	import { Axis, Highlight, Svg } from 'layerchart';
	import { sort } from '@layerstack/utils';
	const data = $state(sort(alphabetData, (d) => d.letter));

	export { data };
</script>

<!-- LayerChart's lollipop, its marks drawn by WebGL: the same props and classes -->
<Chart
	{data}
	x="letter"
	y="frequency"
	yNice
	padding={{ left: 20, bottom: 32 }}
	tooltipContext={{ mode: 'band' }}
	height={400}
>
	<Svg>
		<Axis placement="left" grid rule format="percentRound" />
		<Axis placement="bottom" rule />
	</Svg>
	<WebGL>
		<Rule class="stroke-4 stroke-primary" />
		<Points class="fill-secondary" />
	</WebGL>
	<Svg>
		<Highlight area />
	</Svg>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.letter} />
			<Tooltip.List>
				<Tooltip.Item label="Frequency" value={data.frequency} format="percent" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
