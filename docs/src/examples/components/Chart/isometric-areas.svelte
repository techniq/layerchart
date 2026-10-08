<script lang="ts">
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import { cubicInOut } from 'svelte/easing';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { Area, Axis, Chart, Frame, Grid, isometric, Layer } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

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

	let view = $state<'flat' | 'isometric'>('isometric');
</script>

<Field label="View" class="w-fit">
	<ToggleGroup bind:value={view} variant="outline">
		<ToggleOption value="flat">Flat</ToggleOption>
		<ToggleOption value="isometric">Isometric</ToggleOption>
	</ToggleGroup>
</Field>

<!-- Each series a curtain standing in its own row, as tall as its values -->
<Chart
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
	view={isometric({
		// Flat is seen from the front, edge on to the floor — an overlapping area chart
		rotate: view === 'flat' ? 0 : -40,
		tilt: view === 'flat' ? 90 : 65,
		// A floor wider than it is deep
		aspect: 2.5,
		motion: { type: 'tween', duration: 800, easing: cubicInOut }
	})}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale' }}
	padding={{ top: 24, bottom: 40, left: 40, right: 24 }}
	height={500}
	clip
>
	{#snippet children({ context })}
		{@const m = context.isometricMatrix}
		<TransformContextControls />

		<Layer>
			<Frame class="fill-surface-content/3 stroke-surface-content/20" />
			<Grid x z />
			<Axis placement="bottom" tickLabelProps={{ viewport: true }} />
			<!-- Seen from the front, the rows line up behind one another -->
			{#if view === 'isometric'}
				<Axis placement="left" tickLabelProps={{ viewport: true }} />
			{/if}
			<Axis placement="back" />

			<!-- Back to front: each curtain lies in its own row, so the farther rows go first -->
			{#each [...series].sort( (a, b) => (m ? m.d * (context.yScale(a) - context.yScale(b)) : 0) ) as name}
				<Area
					data={data.filter((d) => d.series === name)}
					fill={context.cScale?.(name)}
					fillOpacity={0.75}
					line={{ stroke: context.cScale?.(name), strokeWidth: 2 }}
				/>
			{/each}
		</Layer>
	{/snippet}
</Chart>
