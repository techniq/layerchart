<script lang="ts">
	import { Axis, Chart, Layer, defaultChartPadding, type DomainType } from 'layerchart';
	import { timeYear } from 'd3-time';
	import { startOfInterval } from '@layerstack/utils';
	import AxisControls from '$lib/components/controls/AxisControls.svelte';

	const today = startOfInterval('day', new Date());

	let initialXDomain = [timeYear.offset(today, -4), today];
	let xDomain = $state<DomainType>(initialXDomain);

	let tickSpacing = $state(80); // x-axis default
</script>

<AxisControls bind:value={tickSpacing} />

<Chart
	{xDomain}
	yDomain={[0, 100]}
	padding={defaultChartPadding({ top: 30, bottom: 30, left: 25, right: 25 })}
	brush={{
		onBrushEnd: (e) => {
			xDomain = e.brush.x;
			e.brush.reset();
		}
	}}
	height={200}
>
	<Layer>
		<Axis placement="bottom" rule grid {tickSpacing} tickMultiline />
		<Axis placement="left" />
	</Layer>
</Chart>

<Chart
	xDomain={initialXDomain}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
	brush={{
		x: xDomain as any,
		onChange: (e) => {
			xDomain = e.brush.x;
		}
	}}
	height={80}
>
	<Layer>
		<Axis placement="bottom" rule grid ticks={{ interval: timeYear.every(1) }} />
	</Layer>
</Chart>
