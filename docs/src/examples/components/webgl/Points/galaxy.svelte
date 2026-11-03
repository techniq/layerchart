<script lang="ts">
	import { RangeField, SelectField } from 'svelte-ux';
	import { interpolateRgb } from 'd3-interpolate';
	import { Chart, Points, WebGL, perspective } from '@layerchart/webgl';
	import type { ChartState } from 'layerchart';

	let count = $state(300_000);
	let branches = $state(3);
	let twist = $state(1);
	let randomness = $state(1);
	let power = $state(1);

	/** How far the galaxy reaches from its middle, in the chart's units */
	const RADIUS = 10;
	/**
	 * How far the view reaches: close in, among the outer stars, so the galaxy spills past the edges
	 * (the plot box is framed, and the stars beyond it drawn too)
	 */
	const VIEW = 3;

	// Seeded, so the galaxy is the same on every load
	function seeded(seed: number) {
		return () => {
			seed = (seed * 16807) % 2147483647;
			return (seed - 1) / 2147483646;
		};
	}

	/**
	 * Each star on one of the arms, at a random distance out, twisted round by `twist` the farther it
	 * is, and scattered off its arm in every direction, up to half `randomness` × its distance out
	 * (closer to the arm as `power` rises)
	 */
	const data = $derived.by(() => {
		const random = seeded(7);
		const scatter = (radius: number) =>
			Math.pow(random(), power) * (random() - 0.5) * randomness * radius;
		return Array.from({ length: count }, (_, i) => {
			const radius = random() * RADIUS;
			const angle = ((i % branches) / branches) * 2 * Math.PI + radius * twist;
			return {
				x: Math.cos(angle) * radius + scatter(radius),
				y: Math.sin(angle) * radius + scatter(radius),
				z: scatter(radius),
				// Out from the middle, in 64 steps (so the layer resolves 64 colors, not one a star)
				out: Math.round((radius / RADIUS) * 63) / 63
			};
		});
	});
	// Warm in the middle, cool at the edges.  Drawn adding their light together, the crowded core
	// glows near white.
	const colorOf = interpolateRgb('#ff6030', '#1b3984');

	// Turning slowly about its middle, as a drag turns it (so the view doesn't refit as it goes), and
	// still while dragged
	let context = $state<ChartState<any>>();
	$effect(() => {
		const transform = context?.transform;
		if (!transform) return;
		let frame = 0;
		let last = performance.now();
		const tick = (now: number) => {
			const rotation = transform.rotation;
			if (rotation && !transform.dragging) {
				transform.setRotation({ x: rotation.x + ((now - last) / 1000) * 6, y: rotation.y });
			}
			last = now;
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});
</script>

<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
	<SelectField
		label="Stars"
		options={[30_000, 100_000, 300_000].map((value) => ({
			label: value.toLocaleString(),
			value
		}))}
		bind:value={count}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<RangeField label="Arms" bind:value={branches} min={2} max={8} />
	<RangeField label="Twist" bind:value={twist} min={-2} max={2} step={0.1} format="decimal" />
	<RangeField
		label="Randomness"
		bind:value={randomness}
		min={0}
		max={1}
		step={0.05}
		format="decimal"
	/>
	<RangeField label="Power" bind:value={power} min={1} max={6} step={0.5} />
</div>

<div class="rounded-sm bg-black">
	<Chart
		{data}
		x="x"
		y="y"
		z="z"
		xDomain={[-VIEW, VIEW]}
		yDomain={[-VIEW, VIEW]}
		zDomain={[-1, 1]}
		zRange={({ width }) => [0, width / VIEW]}
		view={perspective({ rotate: -30, tilt: 55, fov: 75 })}
		transform={{
			mode: 'canvas',
			drag: 'rotate',
			scrollMode: 'scale',
			scrollActivationKey: 'shift'
		}}
		bind:context
		padding={20}
		height={600}
	>
		<WebGL>
			<Points r={0.4} fill={(d) => colorOf(d.out)} glow class="mix-blend-plus-lighter" />
		</WebGL>
	</Chart>
</div>
