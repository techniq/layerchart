<script lang="ts">
	import { LineChart, Tooltip } from 'layerchart';
	import { format } from '@layerstack/utils';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 50, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<p>
	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
	ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
	<span class="w-[124px] h-[18px] inline-block">
		<LineChart
			{data}
			x="date"
			y="value"
			yDomain={null}
			axis={false}
			grid={false}
			props={{
				highlight: { points: { r: 3, class: 'stroke-none' } }
			}}
		>
			{#snippet tooltip({ context })}
				<Tooltip.Root
					{context}
					class="text-xs"
					contained={false}
					y={context.height + 4}
					xOffset={0}
				>
					{#snippet children({ data })}
						<div class="whitespace-nowrap">
							{format(data.date, 'day')}
						</div>
						<div class="font-semibold">
							{data.value}
						</div>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</LineChart>
	</span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis nibh
	volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
</p>
