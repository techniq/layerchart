<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { scaleSqrt } from 'd3-scale';
	import { Chart, Image, Text, Axis, Highlight, Layer, Tooltip, type ChartState } from 'layerchart';
	import { delay } from '@layerstack/utils';
	import LucidePlay from '~icons/lucide/play';
	import LucideSquare from '~icons/lucide/square';

	const planets = [
		{
			name: 'Sun',
			distance: 0,
			radius: 695_000,
			image: 'https://space-facts.com/wp-content/uploads/sun-transparent.png'
		},
		{
			name: 'Mercury',
			distance: 58_000_000,
			radius: 2_440,
			image: 'https://space-facts.com/wp-content/uploads/mercury-transparent.png'
		},
		{
			name: 'Venus',
			distance: 108_000_000,
			radius: 6_052,
			image: 'https://space-facts.com/wp-content/uploads/venus-transparent.png'
		},
		{
			name: 'Earth',
			distance: 150_000_000,
			radius: 6_378,
			image: 'https://space-facts.com/wp-content/uploads/earth-transparent.png'
		},
		{
			name: 'Mars',
			distance: 228_000_000,
			radius: 3_397,
			image: 'https://space-facts.com/wp-content/uploads/mars-transparent.png'
		},
		{
			name: 'Jupiter',
			distance: 778_000_000,
			radius: 71_492,
			image: 'https://space-facts.com/wp-content/uploads/jupiter-transparent.png'
		},
		{
			name: 'Saturn',
			distance: 1_429_000_000,
			radius: 60_268,
			image: 'https://space-facts.com/wp-content/uploads/saturn-transparent.png'
		},
		{
			name: 'Uranus',
			distance: 2_871_000_000,
			radius: 25_559,
			image: 'https://space-facts.com/wp-content/uploads/uranus-transparent.png'
		},
		{
			name: 'Neptune',
			distance: 4_504_000_000,
			radius: 24_766,
			image: 'https://space-facts.com/wp-content/uploads/neptune-transparent.png'
		},
		{
			name: 'Pluto',
			distance: 5_913_000_000,
			radius: 1_150,
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Pluto_in_True_Color_-_High-Res.png/250px-Pluto_in_True_Color_-_High-Res.png'
		}
	];

	// Local sqrt scale for planet radii (not on Chart, to avoid bind:context cycle)
	const rScale = scaleSqrt()
		.domain([0, Math.max(...planets.map((p) => p.radius))])
		.range([2, 25]);

	// Smallest consecutive distance gap (Mercury–Venus: 50M km)
	const minDataGap = planets.reduce(
		(min, p, i) => (i === 0 ? min : Math.min(min, p.distance - planets[i - 1].distance)),
		Infinity
	);
	const maxDistance = planets[planets.length - 1].distance;
	const mercuryDistance = planets[1].distance;
	const maxZoomScale = maxDistance / (mercuryDistance * 1.05);

	let context = $state<ChartState<(typeof planets)[number]>>(null!);
	let playingAnimation = $state<'scale' | 'translate' | null>(null);

	function formatDistance(d: number) {
		if (d === 0) return '0';
		if (d >= 1e9) return `${(d / 1e9).toFixed(1)}B km`;
		return `${Math.round(d / 1e6)}M km`;
	}

	let cancelPlaying: (() => void) | null = null;

	function stopPlaying() {
		cancelPlaying?.();
		cancelPlaying = null;
		playingAnimation = null;
	}

	async function play(name: 'scale' | 'translate', steps: Generator<number>) {
		stopPlaying();
		let cancelled = false;
		cancelPlaying = () => (cancelled = true);
		playingAnimation = name;
		let result = steps.next();
		while (!result.done) {
			if (cancelled) return;
			await delay(result.value);
			if (cancelled) return;
			result = steps.next();
		}
		context.transform.reset();
		cancelPlaying = null;
		playingAnimation = null;
	}

	function zoomToDistance(distance: number) {
		context.transform.setTranslate({ x: 0, y: 0 });
		context.transform.setScale(maxDistance / (distance * 1.05));
	}

	function centerOnPlanet(distance: number) {
		const scale = maxZoomScale;
		const tx = (0.5 - (distance * scale) / maxDistance) * context.width;
		context.transform.setScale(scale);
		context.transform.setTranslate({ x: tx, y: 0 });
	}

	function* scaleSteps() {
		for (const planet of planets.slice(1)) {
			zoomToDistance(planet.distance);
			yield 2000;
		}
	}

	function* translateSteps() {
		for (const planet of planets) {
			centerOnPlanet(planet.distance);
			yield 3000;
		}
	}

	export { planets as data };
</script>

<div class="flex items-center gap-2 mb-2 text-sm">
	<button
		class="px-3 py-1 rounded border border-surface-content/20 hover:bg-surface-content/5"
		onclick={() => {
			stopPlaying();
			zoomToDistance(planets.find((p) => p.name === 'Mars')!.distance);
		}}
	>
		Inner Planets
	</button>
	<button
		class="px-3 py-1 rounded border border-surface-content/20 hover:bg-surface-content/5"
		onclick={() => {
			stopPlaying();
			zoomToDistance(planets.find((p) => p.name === 'Saturn')!.distance);
		}}
	>
		Mid System
	</button>
	<button
		class="px-3 py-1 rounded border border-surface-content/20 hover:bg-surface-content/5"
		onclick={() => {
			stopPlaying();
			context?.transform.reset();
		}}
	>
		Show All
	</button>
	<div class="ml-auto flex items-center gap-2">
		<button
			class="px-3 py-1 rounded border border-pink-500/50 text-pink-500 hover:bg-pink-500/10 inline-flex items-center gap-1"
			onclick={() => {
				if (playingAnimation === 'scale') {
					stopPlaying();
					context?.transform.reset();
				} else {
					play('scale', scaleSteps());
				}
			}}
		>
			{#if playingAnimation === 'scale'}
				<LucideSquare class="size-3" />
			{:else}
				<LucidePlay class="size-3" />
			{/if}
			Scale
		</button>
		<button
			class="px-3 py-1 rounded border border-pink-500/50 text-pink-500 hover:bg-pink-500/10 inline-flex items-center gap-1"
			onclick={() => {
				if (playingAnimation === 'translate') {
					stopPlaying();
					context?.transform.reset();
				} else {
					play('translate', translateSteps());
				}
			}}
		>
			{#if playingAnimation === 'translate'}
				<LucideSquare class="size-3" />
			{:else}
				<LucidePlay class="size-3" />
			{/if}
			Translate
		</button>
	</div>
</div>

<Chart
	data={planets}
	x="distance"
	padding={{ top: 30, bottom: 40, left: 10, right: 10 }}
	transform={{
		mode: 'domain',
		axis: 'x',
		scaleExtent: [1, maxZoomScale],
		scrollMode: 'scale',
		motion: { type: 'spring' },
		domainExtent: { x: { min: 'data', max: 'data' } }
	}}
	tooltipContext={{ mode: 'bisect-x' }}
	bind:context
	height={300}
	clip
>
	{#snippet children({ context })}
		{@const zoomFactor = Math.sqrt(context.transform.scale)}
		{@const minPixelGap = (minDataGap / maxDistance) * context.width * context.transform.scale}
		{@const maxR = Math.min(25 * zoomFactor, minPixelGap / 2)}
		<Layer>
			{#each planets as planet, i (planet.name)}
				{@const cx = context.xScale(planet.distance)}
				{@const r = Math.max(2 * zoomFactor, (rScale(planet.radius) / 25) * maxR)}
				{@const cy = context.height - 20 - (i / (planets.length - 1)) * (context.height - 50)}
				{@const labelY = Math.max(10, cy - r)}
				<line
					x1={cx}
					x2={cx}
					y1={labelY}
					y2={context.height}
					stroke="currentColor"
					stroke-opacity="0.1"
					stroke-dasharray="4 3"
					stroke-width="0.5"
				/>
				<Image href={planet.image} x={cx} y={cy} width={r * 2} height={r * 2} />
				<Text
					value={planet.name}
					x={cx}
					y={labelY}
					textAnchor="middle"
					verticalAnchor="end"
					class="fill-surface-content/70"
					style="font-size: 10px"
				/>
			{/each}
			<Axis placement="bottom" format={formatDistance} />
			<Highlight lines axis="x" />
		</Layer>

		<Tooltip.Root x="data" y={0} anchor="top">
			{#snippet children({ data })}
				<Tooltip.Header>{data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Distance" value={formatDistance(data.distance)} />
					<Tooltip.Item label="Radius" value={`${data.radius.toLocaleString()} km`} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
