<script lang="ts">
	import { randomLcg } from 'd3-random';
	import { Button, Field, SelectField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
	import {
		Chart,
		Light,
		Points,
		Spline,
		Text,
		Tooltip,
		WebGL,
		perspective
	} from '@layerchart/webgl';
	import {
		PLANETS,
		SUN,
		daysSinceJ2000,
		positionOf,
		type Planet
	} from '$lib/utils/solar-system.js';

	// Distances to scale leave the inner planets in a huddle by the Sun, so by default each is
	// drawn at the log of its distance (its direction kept)
	let scale = $state<'log' | 'true'>('log');
	const out = (r: number) => (scale === 'log' ? Math.log10(1 + r / 0.25) : r);
	const reach = $derived(out(50));

	/** A point `x`, `y`, `z` AU from the Sun, as drawn: north is up, and `y` runs down the plot */
	const place = (p: { x: number; y: number; z: number }) => {
		const r = Math.hypot(p.x, p.y, p.z) || 1;
		const k = out(r) / r;
		return { x: p.x * k, y: -p.y * k, z: p.z * k };
	};

	// Days since J2000, moving at `speed` days a second while playing
	let days = $state(daysSinceJ2000(new Date()));
	let playing = $state(true);
	const speeds = [
		{ label: 'A day a second', value: 1 },
		{ label: 'A week a second', value: 7 },
		{ label: 'A month a second', value: 30 },
		{ label: 'A year a second', value: 365 }
	];
	let speed = $state(30);
	$effect(() => {
		if (!playing) return;
		let frame = 0;
		let last = performance.now();
		const tick = (now: number) => {
			days += (speed * (now - last)) / 1000;
			last = now;
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	// Each planet turning on its axis, at a gentle pace rather than its real one (which at a month
	// a second is a blur): the Earth once in 24 seconds, the rest in proportion
	let spin = $state(false);
	let seconds = $state(0);
	$effect(() => {
		if (!spin) return;
		let frame = 0;
		let last = performance.now();
		const tick = (now: number) => {
			seconds += (now - last) / 1000;
			last = now;
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});
	const turned = (body: { day: number }) => (seconds * 15 * 24) / body.day;

	/** Pixels a planet would like to be drawn at: far larger than to scale, which is under a pixel */
	const size = (planet: { radius: number }) => 3 + Math.sqrt(planet.radius / 1000) * 1.6;

	/**
	 * How far (as drawn) each orbit is from its neighbors', for a planet to be no larger than a
	 * share of: so neighbors never overlap, at either scale
	 */
	const room = $derived(
		new Map(
			PLANETS.map((planet, i) => {
				const at = out(planet.elements[0]);
				const inside = i === 0 ? at / 2 : at - out(PLANETS[i - 1].elements[0]);
				const outside = i === PLANETS.length - 1 ? inside : out(PLANETS[i + 1].elements[0]) - at;
				return [planet.name, Math.min(inside, outside)];
			})
		)
	);

	// Where each planet is today, and the path of its orbit
	const planets = $derived(
		PLANETS.map((planet) => ({ ...planet, ...place(positionOf(planet, days)) }))
	);
	const orbits = $derived(
		PLANETS.flatMap((planet) =>
			Array.from({ length: 241 }, (_, k) => ({
				name: planet.name,
				...place(positionOf(planet, 0, (k / 240) * 360))
			}))
		)
	);

	// Saturn's rings: circles about it, square to its leaning axis
	const rings = $derived.by(() => {
		const saturn = planets.find((p) => p.rings)!;
		const [inner, outer] = saturn.rings!;
		const lean = (saturn.tilt * Math.PI) / 180;
		return Array.from({ length: 10 }, (_, ring) => {
			// In radii of Saturn as drawn
			const radius = inner + ((outer - inner) * ring) / 9;
			return Array.from({ length: 73 }, (_, k) => {
				const t = (k / 72) * 2 * Math.PI;
				// The ring's plane leans with the planet (its axis leaning across, towards `x`)
				return {
					ring,
					radius,
					across: Math.cos(t) * Math.cos(lean),
					up: -Math.cos(t) * Math.sin(lean),
					down: Math.sin(t)
				};
			});
		}).flat();
	});

	// A sky of stars, far beyond the planets (seeded, so it's the same on every load)
	const random = randomLcg(0.3);
	const stars = Array.from({ length: 1200 }, () => {
		const u = random() * 2 - 1;
		const t = random() * 2 * Math.PI;
		const s = Math.sqrt(1 - u * u);
		// Mostly faint, a few bright
		const bright = random() ** 3;
		return { x: Math.cos(t) * s, y: Math.sin(t) * s, z: u, r: 0.5 + bright * 1.5, bright };
	});
</script>

<div class="flex flex-wrap gap-2 mb-2 items-end">
	<Field label="Time">
		<Button on:click={() => (playing = !playing)} variant="fill-light" size="sm">
			{playing ? 'Pause' : 'Play'}
		</Button>
	</Field>
	<SelectField
		label="Speed"
		options={speeds}
		bind:value={speed}
		clearable={false}
		toggleIcon={null}
		stepper
		class="w-56"
	/>
	<Field label="Distances">
		<ToggleGroup bind:value={scale} variant="outline">
			<ToggleOption value="log">Log</ToggleOption>
			<ToggleOption value="true">To scale</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Spin">
		<Switch bind:checked={spin} />
	</Field>
</div>

<div class="rounded-sm bg-black text-white">
	<Chart
		view={perspective({ rotate: -20, tilt: 62, fov: 35 })}
		transform={{
			mode: 'canvas',
			drag: 'rotate',
			scrollMode: 'scale',
			scrollActivationKey: 'shift'
		}}
		x="x"
		y="y"
		xDomain={[-reach, reach]}
		yDomain={[-reach, reach]}
		xRange={({ width, height }) => {
			const side = Math.min(width, height);
			return [(width - side) / 2, (width + side) / 2];
		}}
		yRange={({ width, height }) => {
			const side = Math.min(width, height);
			return [(height - side) / 2, (height + side) / 2];
		}}
		zDomain={[-1, 1]}
		zRange={({ width, height }) => {
			// The same pixels to the AU up as across, so orbits keep their tilt
			const perUnit = Math.min(width, height) / (2 * reach);
			return [-perUnit, perUnit];
		}}
		tooltipContext
		height={600}
	>
		{#snippet children({ context })}
			{@const sun = [context.xScale(0), context.yScale(0)] as [number, number]}
			<!-- Pixels to a unit of distance as drawn (the orbits are drawn in a square) -->
			{@const toPixels = Math.min(context.width, context.height) / (2 * reach)}
			<!-- As large as each would like, but no more than 40% of the room between orbits -->
			{@const radiusOf = (planet: Planet) =>
				Math.max(1, Math.min(size(planet), room.get(planet.name)! * toPixels * 0.4))}
			{@const sunRadius = Math.max(
				1.5,
				Math.min(scale === 'log' ? 14 : 7, out(PLANETS[0].elements[0]) * toPixels * 0.5)
			)}
			<!-- Every one named, or to scale (where the inner planets huddle), those with room: from the
			     outside in, where the orbits are far enough apart -->
			{@const named = (() => {
				if (scale === 'log') return new Set(PLANETS.map((planet) => planet.name));
				let last = Infinity;
				return new Set(
					[...PLANETS]
						.reverse()
						.filter((planet) => {
							const at = out(planet.elements[0]) * toPixels;
							if (last - at < 28) return false;
							last = at;
							return true;
						})
						.map((planet) => planet.name)
				);
			})()}
			<WebGL>
				<!-- Lit by the Sun alone, with a little light from everywhere so the night sides show -->
				<Light type="point" x={sun[0]} y={sun[1]} z={0} intensity={1.4} />
				<Light type="ambient" intensity={0.06} />

				<Points
					data={stars}
					x={(d) => d.x * reach * 4}
					y={(d) => d.y * reach * 4}
					z={(d) => d.z * reach * 4}
					r={(d) => d.r * 2.5}
					fill={(d) => `rgb(${[0, 1, 2].map(() => Math.round(110 + d.bright * 145)).join(',')})`}
					glow
				/>

				<Spline
					data={orbits}
					g="name"
					z="z"
					stroke="color-mix(in oklab, white 22%, transparent)"
					strokeWidth={1}
				/>

				<Points
					data={[{ ...SUN, x: 0, y: 0, z: 0 }]}
					r={sunRadius}
					image={(d) => d.image}
					rotate={turned(SUN)}
					glow
					tooltip
				/>
				<Points
					data={planets}
					z="z"
					r={radiusOf}
					fill={(d: Planet) => d.color}
					image={(d: Planet) => d.image}
					rotate={turned}
					tilt={(d: Planet) => d.tilt}
					tooltip
				/>

				<!-- Saturn's rings, around it as it goes -->
				{@const saturn = planets.find((p) => p.rings)!}
				<Spline
					data={rings}
					g="ring"
					x={(d) => saturn.x + (d.radius * radiusOf(saturn) * d.across) / toPixels}
					y={(d) => saturn.y + (d.radius * radiusOf(saturn) * d.down) / toPixels}
					z={(d) => saturn.z + (d.radius * radiusOf(saturn) * d.up) / toPixels}
					stroke="color-mix(in oklab, #e3d29b 45%, transparent)"
					strokeWidth={1}
				/>

				<!-- Each name a little above its planet, however large it's drawn -->
				{#each planets.filter((p) => named.has(p.name)) as planet (planet.name)}
					<Text
						x={context.xScale(planet.x)}
						y={context.yScale(planet.y)}
						z={Number(context.zScale(planet.z)) + radiusOf(planet) + 10}
						value={planet.name}
						viewport
						class="text-[11px] font-semibold uppercase tracking-wider text-white/85"
					/>
				{/each}
			</WebGL>

			<Tooltip.Root>
				{#snippet children({ data })}
					<Tooltip.Header>{data.name}</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item label="Radius" value={`${data.radius.toLocaleString()} km`} />
						{#if data.elements}
							<Tooltip.Item
								label="From the Sun"
								value={`${Math.hypot(...Object.values(positionOf(data, days))).toFixed(2)} AU`}
							/>
						{/if}
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</Chart>
</div>
