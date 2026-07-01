<script lang="ts">
	import { Chart, Waffle, Axis, Text } from 'layerchart';

	const data = [
		{ question: 'don’t go out after dark', yes: 96 },
		{ question: 'do no activities other than school', yes: 89 },
		{ question: 'engage in political discussion and social movements, including online', yes: 10 },
		{ question: 'would like to do activities but are prevented by safety concerns', yes: 73 }
	];
	export { data };

	const TOTAL = 120;
</script>

<div class="text-center mb-2">
	<h3 class="text-2xl font-bold">Subdued</h3>
	<p class="text-sm text-surface-content/60">Of {TOTAL} surveyed Syrian teenagers:</p>
</div>

<Chart
	{data}
	x="question"
	bandPadding={0.2}
	y="yes"
	yDomain={[0, TOTAL]}
	height={300}
	padding={{ top: 8, bottom: 90, left: 0, right: 0 }}
	grid={false}
>
	{#snippet axis({ context })}
		<Axis
			placement="bottom"
			tickLength={0}
			tickLabelProps={{
				width: (context.xScale.bandwidth?.() ?? 0) - 8,
				truncate: false,
				dy: 36,
				class: 'text-xs fill-surface-content/70'
			}}
		/>
	{/snippet}

	{#snippet marks({ context })}
		{@const bw = context.xScale.bandwidth?.() ?? 0}
		<Waffle y={() => TOTAL} fill="currentColor" fillOpacity={0.2} rx="100%" gap={2} />
		<Waffle fill="orange" rx="100%" gap={2} />
		<Text
			{data}
			x="question"
			dx={bw / 2}
			y={context.height + 8}
			value={(d) => `${Math.round((d.yes / TOTAL) * 100)}%`}
			textAnchor="middle"
			verticalAnchor="start"
			class="text-xl font-bold"
			fill="orange"
		/>
	{/snippet}
</Chart>
