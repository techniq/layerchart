<script lang="ts">
	import {
		Axis,
		Chart,
		Grid,
		Highlight,
		Points,
		WebGL,
		Tooltip,
		orthographic,
		perspective
	} from '@layerchart/webgl';
	import { scaleQuantize } from 'd3-scale';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	// Seeded, so the points are the same on every load
	let seed = 7;
	function random() {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	}

	const data = Array.from({ length: 200 }, () => ({
		x: random() * 10,
		y: random() * 10,
		z: random() * 10
	}));

	// Farther points drawn smaller, or every point its true size at any depth
	let camera = $state<'perspective' | 'orthographic'>('perspective');
	// On the plot box's walls and floor, turning with it, or facing the viewer
	let labels = $state<'default' | 'viewport'>('default');
	const labelProps = $derived({ viewport: labels === 'viewport' });

	export { data };
</script>

<div class="flex flex-wrap gap-2">
	<Field label="Camera" class="w-fit">
		<ToggleGroup bind:value={camera} variant="outline">
			<ToggleOption value="perspective">Perspective</ToggleOption>
			<ToggleOption value="orthographic">Orthographic</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Labels" class="w-fit">
		<ToggleGroup bind:value={labels} variant="outline">
			<ToggleOption value="default">Default</ToggleOption>
			<ToggleOption value="viewport">Viewport</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Chart
	padding={40}
	view={camera === 'orthographic' ? orthographic : perspective}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	{data}
	x="x"
	y="y"
	z="z"
	xDomain={[0, 10]}
	yDomain={[0, 10]}
	zDomain={[0, 10]}
	zRange={({ height }) => [0, height]}
	c="z"
	cScale={scaleQuantize()}
	cDomain={[0, 10]}
	cRange={[
		'var(--color-primary-300)',
		'var(--color-primary-500)',
		'var(--color-primary-700)',
		'var(--color-primary-900)'
	]}
	tooltipContext
	height={500}
>
	<WebGL>
		<Grid />
		<Axis placement="bottom" label="x" tickLabelProps={labelProps} {labelProps} />
		<Axis placement="left" label="y" tickLabelProps={labelProps} {labelProps} />
		<Axis placement="back" label="z" tickLabelProps={labelProps} {labelProps} />
		<!-- The hovered point traced on the floor and both back walls, with its spot on each -->
		<Highlight lines={{ strokeWidth: 1 }} shadows axis="both" />
		<Points r={6} tooltip />
		<!-- A ring around the hovered point -->
		<Highlight
			points={{
				r: 8,
				fill: 'none',
				stroke: 'var(--color-surface-content)',
				strokeWidth: 1.5,
				class: 'drop-shadow-none'
			}}
		/>
	</WebGL>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="x" value={data.x} format="decimal" />
				<Tooltip.Item label="y" value={data.y} format="decimal" />
				<Tooltip.Item label="z" value={data.z} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
