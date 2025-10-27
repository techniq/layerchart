<script lang="ts">
	import {
		Area,
		Axis,
		Chart,
		ChartClipPath,
		Highlight,
		Layer,
		LinearGradient,
		Tooltip,
		type DomainType
	} from 'layerchart';
	import { format } from '@layerstack/utils';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();
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
	tooltip={{ mode: 'quadtree-x' }}
	brush={{
		resetOnEnd: true,
		onBrushEnd: (e) => {
			xDomain = e.xDomain;
		}
	}}
	height={300}
>
	{#snippet children({ context })}
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
			<Highlight points lines />
		</Layer>

		<Tooltip.Root
			y="data"
			xOffset={4}
			anchor="bottom"
			variant="none"
			class="text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-xs px-2 py-1 rounded-sm"
		>
			{#snippet children({ data })}
				{format(data.value, 'currency')}
			{/snippet}
		</Tooltip.Root>

		<Tooltip.Root
			x="data"
			y={context.height + context.padding.top}
			yOffset={2}
			anchor="top"
			variant="none"
			class="text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded-sm whitespace-nowrap"
		>
			{#snippet children({ data })}
				{format(data.date, 'day')}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
