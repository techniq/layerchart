<script lang="ts">
	import { Chart, Cell, Axis, Grid, Layer } from 'layerchart';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { scaleBand } from 'd3-scale';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	const size = 12;
	const data = Array.from({ length: size * size }, (_, i) => {
		const x = i % size;
		const y = Math.floor(i / size);
		return { x, y, value: Math.hypot(x - size / 2, y - size / 2) };
	});

	let view = $state<'flat' | 'isometric'>('isometric');
	// 0 = seen from directly above, 1 = true isometric
	const t = Tween.of(() => (view === 'isometric' ? 1 : 0), { duration: 800, easing: cubicInOut });

	export { data };
</script>

<Field label="View">
	<ToggleGroup bind:value={view} variant="outline">
		<ToggleOption value="flat">Flat</ToggleOption>
		<ToggleOption value="isometric">Isometric</ToggleOption>
	</ToggleGroup>
</Field>

<Chart
	{data}
	x="x"
	xScale={scaleBand()}
	y="y"
	yScale={scaleBand()}
	c="value"
	cRange={['var(--color-primary-700)', 'var(--color-primary-100)']}
	isometric={{ rotate: -45 * t.current, tilt: 54.7356 * t.current }}
	padding={{ left: 20, bottom: 20, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Grid x y bandAlign="between" />
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Cell x="x" y="y" fill="value" insets={{ all: 1 }} />
	</Layer>
</Chart>
