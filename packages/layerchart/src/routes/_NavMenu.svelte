<script lang="ts">
  import { NavItem } from 'svelte-ux';
  import { mdiFormatListBulleted, mdiHome, mdiPlayCircle } from '@mdi/js';

  import { page } from '$app/stores';

  type LinkCollection = Record<string, Array<string | { label: string; value: string }>>;

  const charts: LinkCollection = {
    'Cartesian & Polar': ['AreaChart', 'BarChart'],
  };

  const examples: LinkCollection = {
    'Cartesian & Polar': [
      'Arc',
      'Area',
      { label: 'Bar Chart (Vertical)', value: 'Columns' },
      { label: 'Bar Chart (Horizontal)', value: 'Bars' },
      'Candlestick',
      'Compound',
      'DotPlot',
      'DualAxis',
      'Histogram',
      'Line',
      'Oscilloscope',
      'PunchCard',
      'RadialLine',
      'Scatter',
      'Sparkbar',
      'Sparkline',
      'Threshold',
    ],
    Hierarchy: ['Pack', 'Partition', 'Sunburst', 'Tree', 'Treemap'],
    Graph: ['Dagre', 'Sankey'],
    Force: [
      'Beeswarm',
      'CollisionDetection',
      'ForceDisjointGraph',
      'ForceDrag',
      'ForceGraph',
      'ForceGroup',
      'ForceLattice',
      'ForceTree',
      'ForceText',
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
      'Timezones',
      'AnimatedGlobe',
      'TranslucentGlobe',
      'SketchyGlobe',
      'EarthquakeGlobe',
      'SubmarineCablesGlobe',
      'EclipsesGlobe',
      'LoftedArcs',
    ],
  };

  const components: LinkCollection = {
    Charts: ['Chart', 'AreaChart', 'BarChart', 'LineChart', 'PieChart', 'ScatterChart'],
    Common: ['Axis', 'Frame', 'Grid', 'Legend', 'Rule'],
    Primitives: ['Arc', 'Bar', 'Circle', 'Group', 'Line', 'Marker', 'Point', 'Rect', 'Text'],
    Marks: [
      'Area',
      'Bars',
      'Calendar',
      'Hull',
      'Labels',
      'Link',
      'Pie',
      'Points',
      'Spline',
      'Threshold',
    ],
    Interactions: [
      'Brush',
      'Highlight',
      'HitCanvas',
      'Tooltip',
      'TooltipContext',
      'TransformContext',
      'Voronoi',
    ],
    Geo: [
      'GeoContext',
      'GeoCircle',
      'GeoEdgeFade',
      'GeoPath',
      'GeoPoint',
      'GeoSpline',
      'GeoTile',
      'GeoVisible',
      'Graticule',
      'TileImage',
    ],
    Layout: ['ForceSimulation', 'Pack', 'Partition', 'Sankey', 'Treemap'],
    Clipping: ['ClipPath', 'ChartClipPath', 'CircleClipPath', 'RectClipPath'],
    Other: [
      'Blur',
      'Bounds',
      'ColorRamp',
      'LinearGradient',
      'RadialGradient',
      'MotionPath',
      'Pattern',
    ],
  };

  const utils = ['pivot'];
  const tools = ['GeojsonPreview', 'TopojsonPreview', 'ShapefilePreview'];
  const performance = ['expanded', 'expanded_processed', 'chartjs', 'uplot', 'uplot_processed'];
</script>

<NavItem text="Home" icon={mdiHome} currentUrl={$page.url} path="/" />
<NavItem
  text="Getting Started"
  icon={mdiPlayCircle}
  currentUrl={$page.url}
  path="/getting-started"
/>
<NavItem text="Changelog" icon={mdiFormatListBulleted} currentUrl={$page.url} path="/changelog" />

<!-- <h1>Charts</h1>
{#each Object.entries(charts) as [header, items]}
  <h2>{header}</h2>
  {#each items as item}
    {@const label = typeof item === 'object' ? item.label : item}
    {@const pathValue = typeof item === 'object' ? item.value : item}
    <NavItem
      text={label}
      currentUrl={$page.url}
      path="/docs/charts/{pathValue}"
      class="pl-6 py-2"
    />
  {/each}
{/each} -->

<h1>Examples</h1>
{#each Object.entries(examples) as [header, items]}
  <h2>{header}</h2>
  {#each items as item}
    {@const label =
      typeof item === 'object' ? item.label : item.replace(/([a-z])([A-Z])/g, '$1 $2')}
    {@const pathValue = typeof item === 'object' ? item.value : item}
    <NavItem
      text={label}
      currentUrl={$page.url}
      path="/docs/examples/{pathValue}"
      class="pl-6 py-2"
    />
  {/each}
{/each}

<h1>Components</h1>
{#each Object.entries(components) as [header, items]}
  <h2>{header}</h2>
  {#each items as item}
    {@const label = typeof item === 'object' ? item.label : item}
    {@const pathValue = typeof item === 'object' ? item.value : item}
    <NavItem
      text={label}
      currentUrl={$page.url}
      path="/docs/components/{pathValue}"
      class="pl-6 py-2"
    />
  {/each}
{/each}

<h1>Utils</h1>
{#each utils as item}
  <NavItem text={item} currentUrl={$page.url} path="/docs/utils/{item}" class="pl-6 py-2" />
{/each}

<h1>Tools</h1>
{#each tools as item}
  <NavItem
    text={item.replace(/([a-z])([A-Z])/g, '$1 $2')}
    currentUrl={$page.url}
    path="/docs/tools/{item}"
    class="pl-6 py-2"
  />
{/each}

<h1>Performance</h1>
{#each performance as item}
  <NavItem
    text={item.replace(/([a-z])([A-Z])/g, '$1 $2')}
    currentUrl={$page.url}
    path="/performance/{item}"
    class="pl-6 py-2"
  />
{/each}
