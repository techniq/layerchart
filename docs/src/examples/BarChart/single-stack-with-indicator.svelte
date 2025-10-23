<script lang="ts">
	import { BarChart, Polygon } from 'layerchart';

	const data = [
		{
			category: 'Phase 1',
			start: 0,
			end: 25,
			status: 'completed',
			label: '25%'
		},
		{
			category: 'Phase 2',
			start: 25,
			end: 60,
			status: 'in-progress',
			label: '35%'
		},
		{
			category: 'Phase 3',
			start: 60,
			end: 75,
			status: 'planned',
			label: '15%'
		},
		{
			category: 'Phase 4',
			start: 75,
			end: 100,
			status: 'planned',
			label: '25%'
		}
	];

	export { data };
</script>

<div class="h-[68px] p-4 border rounded-sm">
	<BarChart
		{data}
		x={['start', 'end']}
		y={(d) => 1}
		xBaseline={undefined}
		xNice={false}
		c="status"
		cRange={[
			'var(--color-success)',
			'var(--color-warning)',
			'var(--color-surface-300)',
			'var(--color-red-500)'
		]}
		bandPadding={0}
		padding={{ top: 12, bottom: 12 }}
		orientation="horizontal"
		props={{
			xAxis: { ticks: 5 },
			yAxis: { ticks: 0 }
		}}
	>
		{#snippet axis({ context })}
			<!-- Custom axis implementation -->
		{/snippet}

		{#snippet aboveMarks({ context })}
			<Polygon
				points={[
					[50, 0],
					[55, 10],
					[45, 10]
				]}
				class="fill-danger stroke-danger-content stroke-2"
			/>
		{/snippet}

		{#snippet tooltip({ context })}
			<!-- Custom tooltip -->
		{/snippet}
	</BarChart>
</div>
