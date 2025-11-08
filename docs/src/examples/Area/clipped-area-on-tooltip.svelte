<script lang="ts">
	import {
		Area,
		Axis,
		Chart,
		Highlight,
		Layer,
		LinearGradient,
		RectClipPath,
		Tooltip
	} from 'layerchart';
	import { format } from '@layerstack/utils';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ top: 20, bottom: 20 }}
	tooltip={{ mode: 'quadtree-x' }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<LinearGradient class="from-primary/50 to-primary/1" vertical>
				{#snippet children({ gradient })}
					<Area line={{ class: 'stroke-2 stroke-primary opacity-20' }} fill={gradient} />
					<RectClipPath
						x={0}
						y={0}
						width={context.tooltip.data ? context.tooltip.x : context.width}
						height={context.height}
						motion="spring"
					>
						<Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
					</RectClipPath>
				{/snippet}
			</LinearGradient>
			<Highlight points lines={{ class: 'stroke-primary [stroke-dasharray:unset]' }} />
			<Axis placement="bottom" />
		</Layer>

		<Tooltip.Root
			y={48}
			xOffset={4}
			variant="none"
			class="text-sm font-semibold text-primary leading-3"
		>
			{#snippet children({ data })}
				{format(data.value, 'currency')}
			{/snippet}
		</Tooltip.Root>

		<Tooltip.Root x={4} y={4} variant="none" class="text-sm font-semibold leading-3">
			{#snippet children({ data })}
				{format(data.date, 'day')}
			{/snippet}
		</Tooltip.Root>

		<Tooltip.Root
			x="data"
			y={context.height + context.padding.top + 2}
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
