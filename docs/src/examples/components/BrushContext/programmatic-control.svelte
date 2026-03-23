<script lang="ts">
	import { Area, Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
	import { Button, ButtonGroup } from 'svelte-ux';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());
	export { data };

	let context: any = $state();
</script>

<ButtonGroup variant="fill-light" size="sm" class="mb-2">
	<Button
		onclick={() => {
			const mid = Math.floor(data.length / 3);
			context?.brush.move({ x: [data[0].date, data[mid].date] });
		}}>First Third</Button
	>
	<Button
		onclick={() => {
			const start = Math.floor(data.length / 3);
			const end = Math.floor((data.length / 3) * 2);
			context?.brush.move({ x: [data[start].date, data[end].date] });
		}}>Middle Third</Button
	>
	<Button
		onclick={() => {
			const start = Math.floor((data.length / 3) * 2);
			context?.brush.move({ x: [data[start].date, data[data.length - 1].date] });
		}}>Last Third</Button
	>
	<Button onclick={() => context?.brush.selectAll()}>Select All</Button>
	<Button onclick={() => context?.brush.reset()}>Reset</Button>
</ButtonGroup>

<Chart
	bind:context
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	brush
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
	</Layer>
</Chart>
