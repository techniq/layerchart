<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import {
		Area,
		Axis,
		Brush,
		Chart,
		Layer,
		defaultChartPadding,
		type BrushState
	} from 'layerchart';
	import { Button, ButtonGroup } from 'svelte-ux';

	let brush = $state<BrushState>();

	export { data };
</script>

<ButtonGroup variant="fill-light" size="sm" class="mb-2">
	<Button
		onclick={() => {
			const mid = Math.floor(data.length / 3);
			brush?.move({ x: [data[0].date, data[mid].date] });
		}}>First Third</Button
	>
	<Button
		onclick={() => {
			const start = Math.floor((data.length / 3) * 2);
			brush?.move({ x: [data[start].date, data[data.length - 1].date] });
		}}>Last Third</Button
	>
	<Button onclick={() => brush?.selectAll()}>Select All</Button>
	<Button onclick={() => brush?.reset()}>Reset</Button>
</ButtonGroup>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
		<Brush bind:state={brush} />
	</Layer>
</Chart>
