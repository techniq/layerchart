<script module lang="ts">
	import { getVolcano } from '$lib/data.remote.js';
	const volcano = await getVolcano();
</script>

<script lang="ts">
	import { Chart, Light, WebGL, Surface, Tooltip, perspective } from '@layerchart/webgl';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { extent } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateViridis } from 'd3-scale-chromatic';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	let style = $state<'raised' | 'flat'>('raised');
	// How far raised, eased between flat (`0`) and raised (`1`): the `z` range grows and shrinks,
	// so the surface, its contours, and the view's fit all follow it
	const raised = Tween.of(() => (style === 'raised' ? 1 : 0), {
		duration: 800,
		easing: cubicInOut
	});
</script>

<Field label="Style">
	<ToggleGroup bind:value={style} variant="outline">
		<ToggleOption value="raised">Raised</ToggleOption>
		<ToggleOption value="flat">Flat</ToggleOption>
	</ToggleGroup>
</Field>

<!-- Maungawhau (Mt. Eden), Auckland: an 87 × 61 elevation grid -->
<Chart
	view={perspective({ rotate: -25, tilt: 55, aspect: volcano.width / volcano.height })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	cScale={scaleSequential(interpolateViridis)}
	zDomain={extent(volcano.values) as [number, number]}
	zRange={({ height }) => [0, height * 0.35 * raised.current]}
	tooltipContext
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<WebGL>
		<Light azimuth={315} altitude={35} intensity={0.9} shadow />
		<Light type="ambient" intensity={0.55} />
		<Surface
			data={volcano.values}
			width={volcano.width}
			height={volcano.height}
			contours={10}
			tooltip
		/>
	</WebGL>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="elevation" value={data.value} format="integer" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
