<script lang="ts">
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import { cubicInOut } from 'svelte/easing';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { Area, Axis, Chart, Grid, WebGL, perspective } from '@layerchart/webgl';

	// A few series of rises and falls, one row each
	const series = ['North', 'East', 'South', 'West'];
	const data = series.flatMap((name, s) =>
		Array.from({ length: 40 }, (_, i) => ({
			series: name,
			x: i,
			value: 3 + 2 * Math.sin(i / (4 + s) + s) + Math.cos(i / 7 - s) + s * 0.6
		}))
	);

	export { data };

	let view = $state<'front' | 'angled'>('angled');
</script>

<Field label="View" class="w-fit">
	<ToggleGroup bind:value={view} variant="outline">
		<ToggleOption value="front">Front</ToggleOption>
		<ToggleOption value="angled">Angled</ToggleOption>
	</ToggleGroup>
</Field>

<!-- Each series a curtain standing in its own row, as tall as its values.  From the front, an
     overlapping area chart -->
<Chart
	view={perspective({
		rotate: view === 'front' ? 0 : -40,
		tilt: view === 'front' ? 90 : 65,
		fov: view === 'front' ? 4 : 35,
		motion: { type: 'tween', duration: 800, easing: cubicInOut }
	})}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	{data}
	x="x"
	y="series"
	yScale={scaleBand().paddingInner(0.4)}
	z="value"
	zDomain={[0, 9]}
	zRange={({ width }) => [0, width * 0.3]}
	c="series"
	cScale={scaleOrdinal()}
	cRange={['#2caffe', '#544fc5', '#00e272', '#fe6a35']}
	height={500}
>
	<!-- Front on, a narrow field of view flattens the perspective, so the rows line up like a flat
	     chart's; the view eases between the two -->
	<WebGL>
		<Grid y={false} />
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Axis placement="back" />
		<Area opacity={0.75} />
	</WebGL>
</Chart>
