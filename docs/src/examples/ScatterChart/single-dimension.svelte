<script lang="ts">
	import { ScatterChart, Tooltip } from 'layerchart';
	import { randomNormal } from 'd3-random';
	import { format } from '@layerstack/utils';

	const random = randomNormal();
	const data = Array.from({ length: 100 }, () => ({ value: random() }));
	export { data };
</script>

<ScatterChart
	{data}
	x="value"
	y={(d) => 0}
	axis={false}
	grid={false}
	props={{
		points: { opacity: 0.3 },
		highlight: { lines: false }
	}}
	height={48}
>
	{#snippet tooltip({ context })}
		<Tooltip.Root x="data" y="data" yOffset={12} anchor="top">
			{#snippet children({ data })}
				{format(context.x(data))}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</ScatterChart>
