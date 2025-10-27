<script lang="ts">
	import { geoOrthographic, geoCentroid } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { index } from 'd3-array';

	import LucidePlay from '~icons/lucide/play';
	import LucideSquare from '~icons/lucide/square';

	import {
		Chart,
		GeoPath,
		getSettings,
		Graticule,
		Layer,
		Tooltip,
		type ChartContextValue
	} from 'layerchart';
	import { Button, ButtonGroup } from 'svelte-ux';
	import { sortFunc } from '@layerstack/utils';
	// import { scrollIntoView } from '@layerstack/svelte-actions';
	import { cls } from '@layerstack/tailwind';
	import { TimerState } from '@layerstack/svelte-state';

	import { getWorldGeojson } from '$lib/data.remote.js';
	import { timings } from './timings.js';

	const geojson = await getWorldGeojson();
	const countries = feature(geojson, geojson.objects.countries);

	let context = $state<ChartContextValue>(null!);

	let selectedFeature: (typeof countries.features)[0] | null = $state(null);

	$effect.pre(() => {
		if (selectedFeature && context?.transform) {
			const centroid = geoCentroid(selectedFeature);

			context.transform.setTranslate({
				x: -centroid[0],
				y: -centroid[1]
			});
		}
	});

	// Animate to Yakko's song
	// https://animaniacs.fandom.com/wiki/Yakko%27s_World_(song)#New_Updated_Verse
	// https://www.youtube.com/watch?v=BoaLSUKeGWw
	// https://www.youtube.com/watch?v=5pOFKmk7ytU

	const countryFeaturesByName = index(countries.features, (f) => f.properties.name);

	const countryTimings = Object.entries(timings).map(([timing, country], index) => {
		const [hours, minutes, seconds, milli] = timing.split(':');

		return {
			country,
			audioTime: +hours * 60 * 60 + +minutes * 60 + +seconds + +milli / 1000
		};
	});

	// Set to jump to a country
	let currentIndex = $state(-1);
	let isPlaying = $state(false);

	$effect(() => {
		if (
			isPlaying &&
			(audioCurrentTime.current ?? 0) >= countryTimings[currentIndex + 1]?.audioTime
		) {
			const countryName = countryTimings[currentIndex + 1].country;
			selectedFeature = countryFeaturesByName.get(countryName) ?? null;
			currentIndex += 1;
		}
	});

	const audioFile = new Audio('/audio/yakko_world.mp3');
	audioFile.addEventListener('ended', () => stop());

	const audioCurrentTime = new TimerState({
		initial: 0,
		delay: 100,
		tick: () => audioFile.currentTime
	});

	async function play() {
		isPlaying = true;
		audioFile.currentTime = currentIndex !== -1 ? countryTimings[currentIndex].audioTime : 0;
		audioFile.play();
	}

	function stop() {
		isPlaying = false;
		audioFile.pause();
		audioFile.currentTime = 0;
		currentIndex = -1;
		selectedFeature = null;
	}

	let settings = getSettings();
	let layer = $derived(settings.layer);
	let debug = $derived(settings.debug);

	const data = { geojson, countries, timings };

	export { data };
</script>

<div class="h-[600px] grid grid-cols-[224px_1fr] relative">
	<div class="absolute top-0 right-0 z-10 flex items-center gap-3">
		{#if isPlaying && selectedFeature}
			<span class="text-sm px-2 py-1 font-semibold text-primary bg-primary/5 rounded-full">
				{selectedFeature?.properties.name ?? ''}
			</span>
		{/if}
		<ButtonGroup variant="fill-light" color="primary" size="sm">
			<Button
				icon={LucidePlay}
				on:click={play}
				disabled={isPlaying}
				classes={{ icon: 'text-xs' }}
			/>
			<Button
				icon={LucideSquare}
				on:click={stop}
				disabled={!isPlaying}
				classes={{ icon: 'text-xs' }}
			/>
		</ButtonGroup>
	</div>

	<div class="overflow-auto scrollbar-none">
		{#each countries.features.sort(sortFunc('properties.name')) as country (country)}
			{@const isSelected = selectedFeature?.properties.name === country.properties.name}
			<!-- <div use:scrollIntoView={{ condition: isSelected }}> -->
			<div>
				<Button
					variant={isSelected ? 'fill-light' : 'default'}
					color={isSelected ? 'primary' : 'default'}
					fullWidth
					on:click={() => (selectedFeature = country)}
				>
					{country.properties.name}
				</Button>
			</div>
		{/each}
	</div>

	<Chart
		geo={{
			projection: geoOrthographic,
			fitGeojson: countries,
			applyTransform: ['rotate']
		}}
		transform={{
			motion: { type: 'spring', stiffness: 0.04 }
		}}
		tooltip={{ touchEvents: 'none' }}
		bind:context
		height={600}
	>
		{#snippet children()}
			{#if debug}
				<div class="absolute bottom-0 right-0 z-10 grid gap-1">
					<!-- Debug components removed for simplified example -->
				</div>
			{/if}

			<Layer {debug}>
				<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
				<Graticule class="stroke-surface-content/20" />

				{#each countries.features as country (country)}
					<GeoPath
						geojson={country}
						class={cls(
							'stroke-surface-content/50 fill-white cursor-pointer',
							selectedFeature?.properties.name === country.properties.name
								? 'stroke-primary-900 fill-primary'
								: 'hover:fill-gray-200' // Canvas highlight handled below
						)}
						onclick={() => (selectedFeature = country)}
						tooltipContext={context.tooltip}
					/>
				{/each}
			</Layer>

			{#if layer === 'canvas'}
				<!-- Provides better performance by rendering tooltip path on separate <Canvas> -->
				<Layer type="canvas" pointerEvents={false}>
					{#if context.tooltip.data}
						<GeoPath geojson={context.tooltip.data} class="fill-surface-content/20" />
					{/if}
				</Layer>
			{/if}

			<Tooltip.Root>
				{context.tooltip.data.properties.name}
			</Tooltip.Root>
		{/snippet}
	</Chart>
</div>
