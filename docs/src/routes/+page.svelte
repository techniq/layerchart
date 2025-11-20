<script lang="ts">
	import { Button, MenuButton, ThemeSelect, Tooltip } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';

	import ExampleLink from '$lib/components/ExampleLink.svelte';

	import LucideArrowUpRight from '~icons/lucide/arrow-up-right';
	import LucideEllipsisVertical from '~icons/lucide/ellipsis-vertical';

	import LucideGithub from '~icons/lucide/github';
	import CustomBluesky from '~icons/custom-brands/bluesky';
	import CustomDiscord from '~icons/custom-brands/discord';

	const links = [
		{ label: 'Home', href: '/' },
		{ label: 'Docs', href: '/docs' }
	];

	const examples = [
		// Charts
		{ component: 'ArcChart', example: 'gradient-with-text' },
		{ component: 'ArcChart', example: 'basic' },
		{ component: 'ArcChart', example: 'series-labels' },
		{ component: 'ArcChart', example: 'series-track-color' },
		{ component: 'AreaChart', example: 'brush' },
		{ component: 'AreaChart', example: 'curve' },
		{ component: 'AreaChart', example: 'funnel' },
		{ component: 'AreaChart', example: 'range-annotation' },
		{ component: 'AreaChart', example: 'radial' },
		{ component: 'AreaChart', example: 'series-stack-gradient' },
		{ component: 'AreaChart', example: 'sparkline' },
		{ component: 'AreaChart', example: 'threshold' },
		{ component: 'AreaChart', example: 'threshold-gradient' },
		{ component: 'BarChart', example: 'duration' },
		{ component: 'BarChart', example: 'duration-civilization-timeline' },
		{ component: 'BarChart', example: 'gradient' },
		{ component: 'BarChart', example: 'group-series-labels' },
		{ component: 'BarChart', example: 'labels' },
		{ component: 'BarChart', example: 'oscilloscope-frequency' },
		{ component: 'BarChart', example: 'radial-horizontal-duration' },
		{ component: 'BarChart', example: 'radial-horizontal-grid-between' },
		{ component: 'BarChart', example: 'radial-vertical-arcpadding' },
		{ component: 'BarChart', example: 'radial-weather' },
		{ component: 'BarChart', example: 'series-diverging' },
		{ component: 'BarChart', example: 'series-horizontal-diverging' },
		{ component: 'BarChart', example: 'stack-series' },
		{ component: 'BarChart', example: 'series' },
		{ component: 'BarChart', example: 'series-horizontal' },
		{ component: 'BarChart', example: 'single-dimension' },
		{ component: 'BarChart', example: 'single-stack-with-indicator' },
		{ component: 'BarChart', example: 'sparkbar' },
		{ component: 'BarChart', example: 'time-scale-interval' },
		{
			component: 'Chart',
			example: 'compound-separate-scales-with-stacked-charts-and-overridden-marks'
		},
		{ component: 'LineChart', example: 'gradient-encoding' },
		{ component: 'LineChart', example: 'large-radial-series' },
		{ component: 'LineChart', example: 'large-series' },
		{ component: 'LineChart', example: 'radar' },
		{ component: 'LineChart', example: 'radar-series' },
		{ component: 'PieChart', example: 'arc' },
		{ component: 'PieChart', example: 'donut-with-text' },
		{ component: 'PieChart', example: 'series-props' },
		{ component: 'PieChart', example: 'segments' },
		{ component: 'ScatterChart', example: 'punchcard' },
		{ component: 'ScatterChart', example: 'series' },
		// Common
		{ component: 'Axis', example: 'axis-label-placement-top-bottom' },
		{ component: 'Rule', example: 'candlestick-with-brushing' },
		// Primitives
		{ component: 'Arc', example: 'color-wheel' },
		{ component: 'Arc', example: 'label-direction' },
		{ component: 'Connector', example: 'playground' },
		{ component: 'Marker', example: 'styling' },
		{ component: 'Polygon', example: 'hexagon' },
		// Marks
		{ component: 'Calendar', example: 'rounded-cells' },
		{ component: 'Hull', example: 'geo' },
		// Interations
		{ component: 'TransformContext', example: 'pan-zoom-svg-image' },
		{ component: 'BrushContext', example: 'sync-brushes-with-bind-xdomain' },
		{ component: 'Voronoi', example: 'radius' },
		// Fill
		{ component: 'LinearGradient', example: 'tailwind-colors' },
		{ component: 'Pattern', example: 'circles' },
		{ component: 'Pattern', example: 'with-lineargradient' },
		// Geo
		{ component: 'GeoPath', example: 'animated-globe' },
		{ component: 'GeoCircle', example: 'earthquake-globe' },
		{ component: 'GeoCircle', example: 'playground' },
		{ component: 'GeoPath', example: 'bubble-map' },
		{ component: 'GeoPath', example: 'choropleth' },
		{ component: 'GeoPath', example: 'spike-map' },
		{ component: 'GeoPath', example: 'eclipses-globe' },
		{ component: 'GeoPath', example: 'submarine-cables-globe' },
		{ component: 'GeoPath', example: 'timezones' },
		{ component: 'GeoPath', example: 'transform-projection' },
		{ component: 'GeoPath', example: 'translucent-globe' },
		{ component: 'GeoPath', example: 'us-state-with-counties' },
		{ component: 'GeoPoint', example: 'icons' },
		{ component: 'GeoPoint', example: 'us-airports' },
		{ component: 'GeoPoint', example: 'world-airports' },
		{ component: 'GeoSpline', example: 'draggable-globe' },
		{ component: 'GeoSpline', example: 'world-map' },
		{ component: 'GeoTile', example: 'clipped' },
		{ component: 'GeoTile', example: 'zoomable-seamless-layers' },
		{ component: 'Graticule', example: 'basic' },
		// Layout
		{ component: 'Dagre', example: 'playground' },
		{ component: 'Dagre', example: 'tcp-state-diagram' },
		{ component: 'ForceSimulation', example: 'beeswarm' },
		{ component: 'ForceSimulation', example: 'collision-detection' },
		{ component: 'ForceSimulation', example: 'disjoint-graph' },
		{ component: 'ForceSimulation', example: 'lattice' },
		{ component: 'ForceSimulation', example: 'text' },
		{ component: 'ForceSimulation', example: 'tree' },
		{ component: 'Pack', example: 'basic' },
		{ component: 'Partition', example: 'vertical' },
		{ component: 'Partition', example: 'sunburst' },
		{ component: 'Sankey', example: 'hierarchy' },
		{ component: 'Tree', example: 'basic' },
		{ component: 'Treemap', example: 'nested-zoom' },
		// Annotation
		{ component: 'AnnotationLine', example: 'horizontal-with-range' },
		{ component: 'AnnotationPoint', example: 'line-to-point' },
		{ component: 'AnnotationRange', example: 'horizontal-with-fill-multiple' },
		{ component: 'AnnotationRange', example: 'vertical-with-gradient-range' },
		// Other
		{ component: 'MotionPath', example: 'sync-with-draw' }
	];
</script>

<header class="flex h-16 items-center px-4 py-2">
	<a href="/" class="text-xl font-bold w-60">LayerChart</a>

	<div class="flex gap-2 grow justify-center">
		{#each links as { label, href }}
			<a
				{href}
				class={cls(
					'text-sm px-3 py-1 rounded-full text-surface-content hover:bg-primary/10 ',
					href === '/' && 'bg-primary-500/10 text-initial'
				)}
				target={href.startsWith('http') ? '_blank' : '_self'}
			>
				{label}
			</a>
		{/each}
	</div>

	<div class="flex items-center justify-end gap-2 w-60">
		<div class="flex items-center border-r pr-2">
			<ThemeSelect keyboardShortcuts />
		</div>

		<div class="hidden md:flex">
			<Tooltip title="Discord" placement="left" offset={2}>
				<Button
					icon={CustomDiscord}
					href="https://discord.gg/697JhMPD3t"
					class="p-2"
					target="_blank"
				/>
			</Tooltip>

			<Tooltip title="Bluesky" placement="left" offset={2}>
				<Button
					icon={CustomBluesky}
					href="https://bsky.app/profile/techniq.dev"
					class="p-2"
					target="_blank"
				/>
			</Tooltip>

			<Tooltip title="View repository" placement="left" offset={2}>
				<Button
					icon={LucideGithub}
					href="https://github.com/techniq/layerchart"
					class="p-2"
					target="_blank"
				/>
			</Tooltip>
		</div>
		<MenuButton
			icon={LucideEllipsisVertical}
			menuIcon={null}
			iconOnly={true}
			options={[
				{
					label: 'Svelte UX',
					value: 'https://svelte-ux.techniq.dev',
					icon: LucideArrowUpRight
				},
				{
					label: 'Github',
					value: 'https://github.com/techniq/layerchart',
					icon: LucideGithub
				},
				{
					label: 'Discord',
					value: 'https://discord.gg/697JhMPD3t',
					icon: CustomDiscord
				},
				{
					label: 'Bluesky',
					value: 'https://bsky.app/profile/techniq.dev',
					icon: CustomBluesky
				}
			]}
			on:change={(e) => {
				window.open(e.detail.value, '_blank');
			}}
			class="inline-block md:hidden"
		>
			<span slot="selection" class="hidden"></span>
		</MenuButton>
	</div>
</header>

<div class="absolute top-0 w-full h-256 background-gradient pointer-events-none"></div>

<div class="relative h-140 perspective-[1000px] overflow-clip">
	<h1
		class="text-6xl lg:text-8xl text-center mt-8 mb-2 font-extrabold text-transparent bg-clip-text bg-linear-to-br from-blue-500 to-purple-800 tracking-wide"
	>
		LayerChart
	</h1>
	<div class="lg:text-lg text-center font-light max-w-100 px-4 mx-auto">
		Composable Svelte chart components to build a large variety of visualizations
	</div>

	<div class="flex justify-center gap-3 mt-8">
		<Button href="/docs/getting-started" variant="fill" rounded="full">Get Started</Button>
		<Button href="/docs/examples" variant="fill-outline" rounded="full">Examples</Button>
	</div>

	<div
		class="absolute bottom-0 left-0 right-0 background-grid h-140 mask-x-from-80% mask-y-from-80% transform-[rotateX(60deg)] -z-1"
	></div>
</div>

<div class="grid grid-cols-xs gap-4 px-4 mb-4">
	{#each examples as { component, example }}
		<ExampleLink {component} {example} variant="hover-label" aspect="square" />
	{/each}
</div>

<footer class="flex justify-between px-4 py-8 border-t text-surface-content/50 text-sm">
	<div>
		Made by <a href="https://github.com/techniq" target="_blank" class="text-surface-content">
			Sean Lynch
		</a>
		and
		<a
			href="https://github.com/techniq/layerchart/graphs/contributors"
			target="_blank"
			class="text-surface-content"
		>
			contributors
		</a>
	</div>

	<div class="flex gap-5">
		<a href="https://github.com/techniq/layerchart" target="_blank"> Github </a>
		<a href="https://github.com/techniq/layerchart/releases" target="_blank"> Releases </a>
	</div>
</footer>

<style>
	.background-grid {
		--size: 100px;
		--_g: #0000 90deg, color-mix(in srgb, var(--color-surface-content) 5%, transparent) 0;

		background:
			conic-gradient(from 90deg at 2px 2px, var(--_g)) 0 0 / var(--size) var(--size),
			conic-gradient(from 90deg at 1px 1px, var(--_g)) 0 0 / calc(var(--size) / 5)
				calc(var(--size) / 5);
	}
</style>
