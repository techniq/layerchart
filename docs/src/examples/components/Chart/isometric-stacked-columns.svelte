<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import {
		Axis,
		Bars,
		Chart,
		Frame,
		Grid,
		Highlight,
		isometric,
		Layer,
		Legend,
		Tooltip
	} from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { longData } from '$lib/utils/data.js';

	const data = longData;
	export { data };
</script>

<!-- Years across the floor and baskets into it, with each basket's fruit stacked up along `z`.
     Solid colors, since translucent boxes would show their insides -->
<Chart
	{data}
	x="year"
	xScale={scaleBand().paddingInner(0.3)}
	y="basket"
	yScale={scaleBand().paddingInner(0.5)}
	z="value"
	valueAxis="z"
	zRange={({ height }) => [0, height * 1.2]}
	c="fruit"
	cRange={[
		'var(--color-green-500)',
		'var(--color-yellow-500)',
		'var(--color-red-500)',
		'var(--color-purple-500)'
	]}
	view={isometric({ rotate: -25, tilt: 65 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale' }}
	tooltipContext={{ mode: 'manual' }}
	padding={{ top: 24, bottom: 40, left: 40, right: 24 }}
	height={500}
	clip
>
	<TransformContextControls />

	<Layer>
		<Frame class="fill-surface-content/3 stroke-surface-content/20" />
		<Grid z />
		<Axis placement="bottom" format="none" tickLabelProps={{ viewport: true }} />
		<Axis placement="left" format={(d) => `Basket ${d}`} tickLabelProps={{ viewport: true }} />
		<Axis placement="back" format="metric" />
		<!-- Each box is its own hit area, as the floor cell under the pointer may be another box -->
		<Bars tooltip strokeWidth={1} class="stroke-surface-100/40" />
		<Highlight points={{ r: 5 }} />
	</Layer>

	<Legend placement="top-left" variant="swatches" />

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header>{data.year} · Basket {data.basket}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label={data.fruit} value={data.value} format="integer" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
