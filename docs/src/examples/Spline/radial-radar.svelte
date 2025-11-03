<script lang="ts">
	import { curveCatmullRomClosed, curveLinearClosed } from 'd3-shape';
	import { Axis, Chart, Layer, Points, Spline } from 'layerchart';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	const data = [
		{ name: 'fastball', value: 10 },
		{ name: 'change', value: 0 },
		{ name: 'slider', value: 4 },
		{ name: 'cutter', value: 8 },
		{ name: 'curve', value: 5 }
	];
	export { data };

	let curve = $state(curveLinearClosed);
</script>

<Field label="curve: " labelPlacement="left" dense class="absolute top-2 right-2 z-1">
	<ToggleGroup bind:value={curve} size="sm">
		<ToggleOption value={curveLinearClosed}>Linear</ToggleOption>
		<ToggleOption value={curveCatmullRomClosed}>CatmullRom</ToggleOption>
	</ToggleGroup>
</Field>

<Chart
	{data}
	x="name"
	y="value"
	yPadding={[0, 10]}
	padding={{ top: 32, bottom: 8 }}
	radial
	height={300}
>
	<Layer center>
		<Axis
			placement="radius"
			grid={{ class: 'stroke-surface-content/20 fill-surface-200/50' }}
			ticks={[0, 5, 10]}
			format={(d) => ''}
		/>
		<Axis placement="angle" grid={{ class: 'stroke-surface-content/20' }} />
		<Spline {curve} class="stroke-primary fill-primary/20" />
		<Points class="fill-primary stroke-surface-200" />
	</Layer>
</Chart>
