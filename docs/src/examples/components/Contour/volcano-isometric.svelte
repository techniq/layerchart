<script module lang="ts">
	import { getVolcano } from '$lib/data.remote.js';
	const volcano = await getVolcano();
</script>

<script lang="ts">
	import { extent } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateViridis } from 'd3-scale-chromatic';
	import { cubicInOut } from 'svelte/easing';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, Contour, isometric, Layer } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	let style = $state<'lines' | 'filled'>('lines');
	let view = $state<'flat' | 'isometric'>('isometric');
</script>

<div class="flex flex-wrap gap-2">
	<Field label="View">
		<ToggleGroup bind:value={view} variant="outline">
			<ToggleOption value="flat">Flat</ToggleOption>
			<ToggleOption value="isometric">Isometric</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Style">
		<ToggleGroup bind:value={style} variant="outline">
			<ToggleOption value="lines">Lines</ToggleOption>
			<ToggleOption value="filled">Filled</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<!-- Each band raised to its elevation, measured by `zScale` -->
<Chart
	cScale={scaleSequential(interpolateViridis)}
	zDomain={extent(volcano.values)}
	zRange={({ height }) => [0, height * 0.25]}
	view={isometric({
		// Seen from directly above when flat
		rotate: view === 'flat' ? 0 : -35,
		tilt: view === 'flat' ? 0 : 60,
		motion: { type: 'tween', duration: 800, easing: cubicInOut }
	})}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale' }}
	padding={24}
	height={500}
	clip
>
	{#snippet children({ context })}
		<TransformContextControls />

		<Layer>
			<!-- Filled, each band stands on the one below as a terrace; unfilled, they float as lines,
			     kept the same width however far it's zoomed -->
			<Contour
				data={volcano.values}
				width={volcano.width}
				height={volcano.height}
				thresholds={20}
				z="value"
				fill={style === 'lines' ? 'none' : undefined}
				strokeWidth={style === 'lines' ? 1.5 / context.transform.scale : undefined}
			/>
		</Layer>
	{/snippet}
</Chart>
