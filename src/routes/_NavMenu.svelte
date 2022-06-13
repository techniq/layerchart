<script lang="ts">
	import { mdiHome } from '@mdi/js';
	import { NavItem } from 'svelte-ux';
</script>

<NavItem text="Home" icon={mdiHome} path="/" class="pl-6 py-2 mt-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Chart Examples</div>
<NavItem text="Area" path="/examples/Area" class="pl-6 py-2" />
<NavItem text="AreaStack" path="/examples/AreaStack" class="pl-6 py-2" />
<NavItem text="Bars" path="/examples/Bars" class="pl-6 py-2" />
<NavItem text="ClevelandDotPlot" path="/examples/ClevelandDotPlot" class="pl-6 py-2" />
<NavItem text="Partition" path="/examples/Partition" class="pl-6 py-2" />
<NavItem text="Pie" path="/examples/Pie" class="pl-6 py-2" />
<NavItem text="Sankey" path="/examples/Sankey" class="pl-6 py-2" />
<NavItem text="Scatter" path="/examples/Scatter" class="pl-6 py-2" />
<NavItem text="Sunburst (WIP)" path="/examples/Sunburst" class="pl-6 py-2" />
<NavItem text="Threshold" path="/examples/Threshold" class="pl-6 py-2" />
<NavItem text="Tree" path="/examples/Tree" class="pl-6 py-2" />
<NavItem text="Treemap" path="/examples/Treemap" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Common</div>
<NavItem text="Chart" path="/components/Chart" class="pl-6 py-2" />
<NavItem text="Axis" path="/components/Axis" class="pl-6 py-2" />
<NavItem text="Baseline" path="/components/Baseline" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Primatives</div>
<NavItem text="Arc" path="/components/Arc" class="pl-6 py-2" />
<NavItem text="Area" path="/components/Area" class="pl-6 py-2" />
<NavItem text="Bounds" path="/components/Bounds" class="pl-6 py-2" />
<NavItem text="ChartClipPath" path="/components/ChartClipPath" class="pl-6 py-2" />
<NavItem text="Circle" path="/components/Circle" class="pl-6 py-2" />
<NavItem text="CircleClipPath" path="/components/CircleClipPath" class="pl-6 py-2" />
<NavItem text="ClipPath" path="/components/ClipPath" class="pl-6 py-2" />
<NavItem text="Group" path="/components/Group" class="pl-6 py-2" />
<NavItem text="Line" path="/components/Line" class="pl-6 py-2" />
<NavItem text="LinearGradient" path="/components/LinearGradient" class="pl-6 py-2" />
<NavItem text="Path" path="/components/Path" class="pl-6 py-2" />
<NavItem text="Pattern" path="/components/Pattern" class="pl-6 py-2" />
<NavItem text="Rect" path="/components/Rect" class="pl-6 py-2" />
<NavItem text="RectClipPath" path="/components/RectClipPath" class="pl-6 py-2" />
<NavItem text="Text" path="/components/Text" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Data-driven</div>
<NavItem text="AreaStack" path="/components/AreaStack" class="pl-6 py-2" />
<NavItem text="Bars" path="/components/Bars" class="pl-6 py-2" />
<NavItem text="ConnectedPoints" path="/components/ConnectedPoints" class="pl-6 py-2" />
<NavItem text="Labels" path="/components/Labels" class="pl-6 py-2" />
<NavItem text="Points" path="/components/Points" class="pl-6 py-2" />
<NavItem text="Threshold" path="/components/Threshold" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Interactions</div>
<NavItem text="Tooltip" path="/components/Tooltip" class="pl-6 py-2" />
<NavItem text="HighlightRect" path="/components/HighlightRect" class="pl-6 py-2" />
<NavItem text="HighlightLine" path="/components/HighlightLine" class="pl-6 py-2" />
<NavItem text="Zoom" path="/components/Zoom" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Utils</div>
<NavItem text="pivot" path="/utils/pivot" class="pl-6 py-2" />
