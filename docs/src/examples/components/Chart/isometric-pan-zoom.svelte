<script lang="ts">
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { Axis, Chart, ChartClipPath, Circle, Frame, Grid, isometric, Layer } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	// Seeded, so the points are the same on every load
	let seed = 7;
	function random() {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	}

	const data = Array.from({ length: 200 }, () => ({ x: random() * 10, y: random() * 10 }));
	export { data };

	let mode = $state<'canvas' | 'domain'>('domain');
</script>

<Field label="Mode" class="w-fit">
	<ToggleGroup bind:value={mode} variant="outline">
		<ToggleOption value="domain">Domain</ToggleOption>
		<ToggleOption value="canvas">Canvas</ToggleOption>
	</ToggleGroup>
</Field>

<!-- Drag to pan and scroll to zoom; shift-drag to turn.  `domain` re-ticks the axes and keeps the
     points their size, while `canvas` zooms the drawing -->
<Chart
	{data}
	x="x"
	y="y"
	xDomain={[0, 10]}
	yDomain={[0, 10]}
	view={isometric}
	transform={{ mode, scrollMode: 'scale' }}
	padding={{ top: 24, bottom: 40, left: 40, right: 24 }}
	height={400}
	clip
	class="cursor-grab active:cursor-grabbing"
>
	<TransformContextControls />

	<Layer>
		<Frame class="fill-surface-content/3 stroke-surface-content/20" />
		<Grid x y />
		<Axis placement="bottom" tickLabelProps={{ viewport: true }} />
		<Axis placement="left" tickLabelProps={{ viewport: true }} />
		<!-- Clipped to the floor, as panning moves points past its edge -->
		<ChartClipPath>
			<Circle cx="x" cy="y" r={4} viewport class="fill-primary" />
		</ChartClipPath>
	</Layer>
</Chart>
