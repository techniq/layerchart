<script lang="ts">
	import { NavItem } from 'svelte-ux';
	import { mdiHome } from '@mdi/js';

	import { page } from '$app/stores';

	const examples = {
		Chart: [
			'Area',
			'AreaStack',
			{ label: 'Bar Chart (Vertical)', value: 'Columns' },
			{ label: 'Bar Chart (Horizontal)', value: 'Bars' },
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
			'GeojsonPreview',
			'ShapefilePreview'
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

<NavItem text="Home" icon={mdiHome} currentUrl={$page.url} path="/" />

<h1>Examples</h1>
{#each Object.entries(examples) as [header, items]}
	<h2>{header}</h2>
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

<h1>Components</h1>
{#each Object.entries(components) as [header, items]}
	<h2>{header}</h2>
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

<h1>Utils</h1>
{#each utils as item}
	<NavItem text={item} currentUrl={$page.url} path="/docs/utils/{item}" class="pl-6 py-2" />
{/each}
