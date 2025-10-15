<script lang="ts">
	import { Axis, Chart, Layer, Text } from 'layerchart';
	import { timeDay } from 'd3-time';
	import { startOfInterval } from '@layerstack/utils';

	const today = startOfInterval('day', new Date());
</script>

<Chart
	xDomain={[timeDay.offset(today, -10), today]}
	yDomain={[0, 100]}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
	height={200}
>
	<Layer>
		<Axis
			placement="bottom"
			rule
			ticks={(scale) => scale.domain()}
			format={{ type: 'day', options: { variant: 'long' } }}
		>
			{#snippet tickLabel({ props, index })}
				<Text {...props} textAnchor={index === 0 ? 'start' : 'end'} />
			{/snippet}
		</Axis>
		<Axis placement="left" rule ticks={(scale) => scale.domain()} />
	</Layer>
</Chart>
