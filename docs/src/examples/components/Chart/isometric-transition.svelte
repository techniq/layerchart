<script lang="ts">
	import { Chart, Cell, Axis, Grid, Layer } from 'layerchart';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { scaleBand, scaleQuantize } from 'd3-scale';
	import { extent } from 'd3-array';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	const size = 12;
	const data = Array.from({ length: size * size }, (_, i) => {
		const x = i % size;
		const y = Math.floor(i / size);
		return { x, y, value: Math.hypot(x - size / 2, y - size / 2) };
	});

	let view = $state<'flat' | 'isometric'>('isometric');
	let labels = $state<'default' | 'viewport'>('default');
	// 0 = seen from directly above, 1 = true isometric
	const t = Tween.of(() => (view === 'isometric' ? 1 : 0), { duration: 800, easing: cubicInOut });

	export { data };
</script>

<div class="flex gap-2">
	<Field label="View">
		<ToggleGroup bind:value={view} variant="outline">
			<ToggleOption value="flat">Flat</ToggleOption>
			<ToggleOption value="isometric">Isometric</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Labels">
		<ToggleGroup bind:value={labels} variant="outline">
			<ToggleOption value="default">Default</ToggleOption>
			<ToggleOption value="viewport">Viewport</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Chart
	{data}
	x="x"
	xScale={scaleBand()}
	y="y"
	yScale={scaleBand()}
	c="value"
	cScale={scaleQuantize()}
	cDomain={extent(data, (d) => d.value)}
	cRange={[
		'var(--color-primary-700)',
		'var(--color-primary-500)',
		'var(--color-primary-300)',
		'var(--color-primary-100)'
	]}
	isometric={{ rotate: -45 * t.current, tilt: 54.7356 * t.current }}
	padding={{ left: 20, bottom: 20, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Grid x y bandAlign="between" />
		<Axis placement="bottom" tickLabelProps={{ viewport: labels === 'viewport' }} />
		<Axis placement="left" tickLabelProps={{ viewport: labels === 'viewport' }} />
		<Cell x="x" y="y" fill="value" insets={{ all: 1 }} />
	</Layer>
</Chart>
