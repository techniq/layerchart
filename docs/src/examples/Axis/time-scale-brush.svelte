<script lang="ts">
	import { Axis, Chart, Layer, type DomainType } from 'layerchart';
	import { timeYear } from 'd3-time';
	import { startOfInterval } from '@layerstack/utils';
	import { RangeField } from 'svelte-ux';

	const today = startOfInterval('day', new Date());

	let initialXDomain = [timeYear.offset(today, -4), today];
	let xDomain = $state<DomainType>(initialXDomain);

	let tickSpacing = $state(80); // x-axis default
</script>

<RangeField
	label="tickSpacing"
	labelPlacement="left"
	bind:value={tickSpacing}
	min={10}
	max={300}
	step={10}
	class="justify-self-end mb-2"
/>

<Chart
	{xDomain}
	yDomain={[0, 100]}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
	brush={{
		resetOnEnd: true,
		onBrushEnd: (e) => {
			xDomain = e.xDomain;
		}
	}}
	height={200}
>
	<Layer>
		<Axis placement="bottom" rule grid {tickSpacing} />
		<Axis placement="left" />
	</Layer>
</Chart>

<Chart
	xDomain={initialXDomain}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
	brush={{
		mode: 'separated',
		xDomain,
		onChange: (e) => {
			xDomain = e.xDomain;
		}
	}}
	height={80}
>
	<Layer>
		<Axis placement="bottom" rule grid ticks={{ interval: timeYear.every(1) }} />
	</Layer>
</Chart>
