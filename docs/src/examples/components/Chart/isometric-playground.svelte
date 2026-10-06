<script lang="ts">
	import { Chart, Cell, Axis, Grid, Layer } from 'layerchart';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { scaleBand, scaleQuantize } from 'd3-scale';
	import { extent } from 'd3-array';
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	// A hill: tallest in the middle, falling away to the corners
	const size = 12;
	const centre = (size - 1) / 2;
	const data = Array.from({ length: size * size }, (_, i) => {
		const x = i % size;
		const y = Math.floor(i / size);
		return { x, y, value: Math.hypot(centre, centre) - Math.hypot(x - centre, y - centre) };
	});

	let view = $state<'flat' | 'isometric'>('isometric');
	// Seen from directly above, the angles, heights, and label orientation have nothing to change
	const flat = $derived(view === 'flat');
	let labels = $state<'default' | 'viewport'>('default');
	// The top of the `z` range, in pixels — `0` keeps the floor flat
	let height = $state(80);
	// True isometric to start: turned 45° to bring the origin to the front, tipped back until both
	// axes meet the horizontal at 30°
	let rotate = $state(-45);
	let tilt = $state(54.7356);
	// 0 = seen from directly above, 1 = the view the sliders set
	const t = Tween.of(() => (view === 'isometric' ? 1 : 0), { duration: 800, easing: cubicInOut });

	// Dragging the chart turns and tips the view (`transform` in `projection` mode) — keep the
	// sliders in step, once the view has eased in rather than partway through it
	function onTransform({ translate }: { translate: { x: number; y: number } }) {
		if (flat || t.current !== 1) return;
		// Wrapped to the slider's ±180° — the same turn either way round
		rotate = ((((translate.x + 180) % 360) + 360) % 360) - 180;
		tilt = translate.y;
	}

	export { data };
</script>

<div class="flex flex-wrap gap-2">
	<Field label="View">
		<ToggleGroup bind:value={view} variant="outline">
			<ToggleOption value="flat">Flat</ToggleOption>
			<ToggleOption value="isometric">Isometric</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Labels" disabled={flat}>
		<ToggleGroup bind:value={labels} variant="outline">
			<ToggleOption value="default">Default</ToggleOption>
			<ToggleOption value="viewport">Viewport</ToggleOption>
		</ToggleGroup>
	</Field>
	<RangeField
		label="Rotate"
		disabled={flat}
		bind:value={rotate}
		min={-180}
		max={180}
		step={1}
		format="integer"
		class="w-48"
	/>
	<RangeField
		label="Tilt"
		disabled={flat}
		bind:value={tilt}
		min={0}
		max={89}
		step={1}
		format="integer"
		class="w-48"
	/>
	<RangeField
		label="Height"
		disabled={flat}
		bind:value={height}
		min={0}
		max={200}
		step={10}
		class="w-48"
	/>
</div>

<Chart
	{data}
	x="x"
	xScale={scaleBand()}
	y="y"
	yScale={scaleBand()}
	z="value"
	zRange={[0, height]}
	c="value"
	cScale={scaleQuantize()}
	cDomain={extent(data, (d) => d.value)}
	cRange={[
		'var(--color-primary-100)',
		'var(--color-primary-300)',
		'var(--color-primary-500)',
		'var(--color-primary-700)'
	]}
	isometric={{ rotate: rotate * t.current, tilt: tilt * t.current }}
	transform={{ mode: 'projection', disablePointer: flat }}
	{onTransform}
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
