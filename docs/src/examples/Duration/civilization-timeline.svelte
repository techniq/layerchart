<script lang="ts">
	import { BarChart, Tooltip } from 'layerchart';
	import { getCivilizationEvents } from '$lib/data.remote.js';

	const data = await getCivilizationEvents();
	export { data };

	function formatYear(number: number): string {
		return Math.sign(number) === -1 ? Math.abs(number) + ' BC' : number + ' AD';
	}
</script>

<BarChart
	{data}
	x={['start', 'end']}
	y="civilization"
	c="region"
	cRange={[
		'var(--color-danger)',
		'var(--color-warning)',
		'var(--color-success)',
		'var(--color-info)'
	]}
	rule={false}
	orientation="horizontal"
	padding={{ left: 200, bottom: 36, right: 36 }}
	props={{
		xAxis: {
			format: formatYear
		},
		yAxis: {
			tickLabelProps: {
				width: 300,
				truncate: { position: 'middle' }
			}
		}
	}}
	height={700}
>
	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.civilization}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="region" value={data.region} />
					<Tooltip.Item label="timeline" value={data.timeline} />
					<!-- <Tooltip.Item label="start label" value={data.startLabel} />
              <Tooltip.Item label="end label" value={data.endLabel} /> -->
					<Tooltip.Item label="start" value={data.start} format={formatYear} />
					<Tooltip.Item label="end" value={data.end} format={formatYear} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
