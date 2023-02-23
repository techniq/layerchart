<script lang="ts">
	import { NavItem } from 'svelte-ux';
	import { mdiHome } from '@mdi/js';

	import { page } from '$app/stores';
</script>

<NavItem text="Home" icon={mdiHome} currentUrl={$page.url} path="/" class="pl-6 py-2 mt-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Chart Examples</div>
<NavItem text="Area" currentUrl={$page.url} path="/docs/examples/Area" class="pl-6 py-2" />
<NavItem
	text="AreaStack"
	currentUrl={$page.url}
	path="/docs/examples/AreaStack"
	class="pl-6 py-2"
/>
<NavItem text="Bars" currentUrl={$page.url} path="/docs/examples/Bars" class="pl-6 py-2" />
<NavItem
	text="ClevelandDotPlot"
	currentUrl={$page.url}
	path="/docs/examples/ClevelandDotPlot"
	class="pl-6 py-2"
/>
<NavItem text="Pack" currentUrl={$page.url} path="/docs/examples/Pack" class="pl-6 py-2" />
<NavItem
	text="Partition"
	currentUrl={$page.url}
	path="/docs/examples/Partition"
	class="pl-6 py-2"
/>
<NavItem text="Pie" currentUrl={$page.url} path="/docs/examples/Pie" class="pl-6 py-2" />
<NavItem text="Sankey" currentUrl={$page.url} path="/docs/examples/Sankey" class="pl-6 py-2" />
<NavItem text="Scatter" currentUrl={$page.url} path="/docs/examples/Scatter" class="pl-6 py-2" />
<NavItem text="Sunburst" currentUrl={$page.url} path="/docs/examples/Sunburst" class="pl-6 py-2" />
<NavItem
	text="Threshold"
	currentUrl={$page.url}
	path="/docs/examples/Threshold"
	class="pl-6 py-2"
/>
<NavItem text="Tree" currentUrl={$page.url} path="/docs/examples/Tree" class="pl-6 py-2" />
<NavItem text="Treemap" currentUrl={$page.url} path="/docs/examples/Treemap" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Geo Examples</div>
<NavItem text="GeoPath" currentUrl={$page.url} path="/docs/examples/GeoPath" class="pl-6 py-2" />
<NavItem text="GeoPoint" currentUrl={$page.url} path="/docs/examples/GeoPoint" class="pl-6 py-2" />
<NavItem text="GeoTile" currentUrl={$page.url} path="/docs/examples/GeoTile" class="pl-6 py-2" />
<NavItem
	text="Projections"
	currentUrl={$page.url}
	path="/docs/examples/GeoProjection"
	class="pl-6 py-2"
/>
<NavItem
	text="Choropleth"
	currentUrl={$page.url}
	path="/docs/examples/Choropleth"
	class="pl-6 py-2"
/>
<NavItem text="State Map" currentUrl={$page.url} path="/docs/examples/StateMap" class="pl-6 py-2" />
<NavItem
	text="Country Map"
	currentUrl={$page.url}
	path="/docs/examples/CountryMap"
	class="pl-6 py-2"
/>
<NavItem
	text="Animated Globe"
	currentUrl={$page.url}
	path="/docs/examples/AnimatedGlobe"
	class="pl-6 py-2"
/>
<NavItem
	text="Zoomable Map"
	currentUrl={$page.url}
	path="/docs/examples/ZoomableMap"
	class="pl-6 py-2"
/>
<NavItem
	text="Zoomable Tile Map"
	currentUrl={$page.url}
	path="/docs/examples/ZoomableTileMap"
	class="pl-6 py-2"
/>
<NavItem
	text="Bubble Map"
	currentUrl={$page.url}
	path="/docs/examples/BubbleMap"
	class="pl-6 py-2"
/>
<NavItem text="Spike Map" currentUrl={$page.url} path="/docs/examples/SpikeMap" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Common</div>
<NavItem text="Chart" currentUrl={$page.url} path="/docs/components/Chart" class="pl-6 py-2" />
<NavItem text="Axis" currentUrl={$page.url} path="/docs/components/Axis" class="pl-6 py-2" />
<NavItem
	text="Baseline"
	currentUrl={$page.url}
	path="/docs/components/Baseline"
	class="pl-6 py-2"
/>
<NavItem text="Legend" currentUrl={$page.url} path="/docs/components/Legend" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Primatives</div>
<NavItem text="Arc" currentUrl={$page.url} path="/docs/components/Arc" class="pl-6 py-2" />
<NavItem text="Area" currentUrl={$page.url} path="/docs/components/Area" class="pl-6 py-2" />
<NavItem text="Bounds" currentUrl={$page.url} path="/docs/components/Bounds" class="pl-6 py-2" />
<NavItem
	text="ChartClipPath"
	currentUrl={$page.url}
	path="/docs/components/ChartClipPath"
	class="pl-6 py-2"
/>
<NavItem text="Circle" currentUrl={$page.url} path="/docs/components/Circle" class="pl-6 py-2" />
<NavItem
	text="CircleClipPath"
	currentUrl={$page.url}
	path="/docs/components/CircleClipPath"
	class="pl-6 py-2"
/>
<NavItem
	text="ClipPath"
	currentUrl={$page.url}
	path="/docs/components/ClipPath"
	class="pl-6 py-2"
/>
<NavItem
	text="ColorRamp"
	currentUrl={$page.url}
	path="/docs/components/ColorRamp"
	class="pl-6 py-2"
/>
<NavItem text="Group" currentUrl={$page.url} path="/docs/components/Group" class="pl-6 py-2" />
<NavItem text="Line" currentUrl={$page.url} path="/docs/components/Line" class="pl-6 py-2" />
<NavItem
	text="LinearGradient"
	currentUrl={$page.url}
	path="/docs/components/LinearGradient"
	class="pl-6 py-2"
/>
<NavItem text="Path" currentUrl={$page.url} path="/docs/components/Path" class="pl-6 py-2" />
<NavItem text="Pattern" currentUrl={$page.url} path="/docs/components/Pattern" class="pl-6 py-2" />
<NavItem text="Rect" currentUrl={$page.url} path="/docs/components/Rect" class="pl-6 py-2" />
<NavItem
	text="RectClipPath"
	currentUrl={$page.url}
	path="/docs/components/RectClipPath"
	class="pl-6 py-2"
/>
<NavItem text="Text" currentUrl={$page.url} path="/docs/components/Text" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Data-driven</div>
<NavItem
	text="AreaStack"
	currentUrl={$page.url}
	path="/docs/components/AreaStack"
	class="pl-6 py-2"
/>
<NavItem text="Bars" currentUrl={$page.url} path="/docs/components/Bars" class="pl-6 py-2" />
<NavItem
	text="ConnectedPoints"
	currentUrl={$page.url}
	path="/docs/components/ConnectedPoints"
	class="pl-6 py-2"
/>
<NavItem text="Labels" currentUrl={$page.url} path="/docs/components/Labels" class="pl-6 py-2" />
<NavItem text="Points" currentUrl={$page.url} path="/docs/components/Points" class="pl-6 py-2" />
<NavItem
	text="Threshold"
	currentUrl={$page.url}
	path="/docs/components/Threshold"
	class="pl-6 py-2"
/>

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Interactions</div>
<NavItem text="Tooltip" currentUrl={$page.url} path="/docs/components/Tooltip" class="pl-6 py-2" />
<NavItem
	text="TooltipContext"
	currentUrl={$page.url}
	path="/docs/components/TooltipContext"
	class="pl-6 py-2"
/>
<NavItem
	text="HighlightRect"
	currentUrl={$page.url}
	path="/docs/components/HighlightRect"
	class="pl-6 py-2"
/>
<NavItem
	text="HighlightLine"
	currentUrl={$page.url}
	path="/docs/components/HighlightLine"
	class="pl-6 py-2"
/>
<NavItem text="Zoom" currentUrl={$page.url} path="/docs/components/Zoom" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Utils</div>
<NavItem text="pivot" currentUrl={$page.url} path="/docs/utils/pivot" class="pl-6 py-2" />
