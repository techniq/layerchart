<script lang="ts">
	import { NavItem } from 'svelte-ux';
	import { mdiHome } from '@mdi/js';

	import { page } from '$app/stores';

	const examples = {
		Chart: [
			'Area',
			'AreaStack',
			'Bars',
			'ClevelandDotPlot',
			'Pack',
			'Partition',
			'PunchCard',
			'Pie',
			'Sankey',
			'Scatter',
			'Sunburst',
			'Threshold',
			'Tree',
			'Treemap'
		],
		Geo: [
			'GeoPath',
			'GeoPoint',
			'GeoTile',
			{ label: 'Projections', value: 'GeoProjection' },
			'StateMap',
			'CountryMap',
			'Choropleth',
			'BubbleMap',
			'SpikeMap',
			'ZoomableMap',
			'ZoomableTileMap',
			'AnimatedGlobe',
			'LoftedArcsGlobe',
			'Shapefile'
		]
	};

	const components = {
		Common: ['Chart', 'Axis', 'Baseline', 'Legend'],
		Primatives: [
			'Arc',
			'Area',
			'Blur',
			'Bounds',
			'ChartClipPath',
			'Circle',
			'CircleClipPath',
			'ClipPath',
			'ColorRamp',
			'Group',
			'Line',
			'LinearGradient',
			'Link',
			'Path',
			'Pattern',
			'Rect',
			'RectClipPath',
			'Text'
		],
		'Data-driven': ['AreaStack', 'Bars', 'ConnectedPoints', 'Labels', 'Points', 'Threshold'],
		Interactions: ['Tooltip', 'TooltipContext', 'HighlightRect', 'HighlightLine', 'Zoom'],
		Geo: ['GeoContext', 'GeoPath', 'GeoPoint', 'GeoTile', 'Graticule', 'TileImage'],
		Hierarchy: ['Pack', 'Partition', 'Sankey']
	};

	const utils = ['pivot'];
</script>

<NavItem text="Home" icon={mdiHome} currentUrl={$page.url} path="/" class="pl-6 py-2 mt-2" />

<div
	class="py-2 pl-4 mt-4 text-sm text-gray-200 font-bold bg-black/20 border-t border-b border-white/10"
>
	Examples
</div>
{#each Object.entries(examples) as [header, items]}
	<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">{header}</div>
	{#each items as item}
		{#if typeof item === 'object'}
			<NavItem
				text={item.label}
				currentUrl={$page.url}
				path="/docs/examples/{item.value}"
				class="pl-6 py-2"
			/>
		{:else}
			<NavItem
				text={item.replace(/([a-z])([A-Z])/g, '$1 $2')}
				currentUrl={$page.url}
				path="/docs/examples/{item}"
				class="pl-6 py-2"
			/>
		{/if}
	{/each}
{/each}

<div
	class="py-2 pl-4 mt-4 text-sm text-gray-200 font-bold bg-black/20 border-t border-b border-white/10"
>
	Components
</div>
{#each Object.entries(components) as [header, items]}
	<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">{header}</div>
	{#each items as item}
		{#if typeof item === 'object'}
			<NavItem
				text={item.label}
				currentUrl={$page.url}
				path="/docs/components/{item.value}"
				class="pl-6 py-2"
			/>
		{:else}
			<NavItem
				text={item}
				currentUrl={$page.url}
				path="/docs/components/{item}"
				class="pl-6 py-2"
			/>
		{/if}
	{/each}
{/each}

<div
	class="py-2 pl-4 mt-4 text-sm text-gray-200 font-bold bg-black/20 border-t border-b border-white/10"
>
	Utils
</div>
{#each utils as item}
	<NavItem text={item} currentUrl={$page.url} path="/docs/utils/{item}" class="pl-6 py-2" />
{/each}
