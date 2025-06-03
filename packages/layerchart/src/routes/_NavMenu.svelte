<script lang="ts">
  import { NavItem } from 'svelte-ux';
  import { mdiFormatListBulleted, mdiHome, mdiPlayCircle } from '@mdi/js';

  import { page } from '$app/state';

  type LinkCollection = Record<string, Array<string | { label: string; value: string }>>;

  const examples: LinkCollection = {
    'Cartesian & Polar': [
      'Arc',
      'Area',
      { label: 'Bar Chart (Vertical)', value: 'Columns' },
      { label: 'Bar Chart (Horizontal)', value: 'Bars' },
      'Candlestick',
      'Compound',
      'Duration',
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
    Charts: ['Chart', 'ArcChart', 'AreaChart', 'BarChart', 'LineChart', 'PieChart', 'ScatterChart'],
    Common: ['Axis', 'Frame', 'Grid', 'Legend', 'Rule'],
    Primitives: [
      'Arc',
      'Bar',
      'Circle',
      'Connector',
      'Ellipse',
      'Group',
      'Line',
      'Marker',
      'Point',
      'Polygon',
      'Rect',
      'Text',
    ],
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
    Annotations: ['AnnotationLine', 'AnnotationPoint', 'AnnotationRange'],
    Interactions: [
      'BrushContext',
      'Highlight',
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
    Layout: ['ForceSimulation', 'Pack', 'Partition', 'Sankey', 'Tree', 'Treemap'],
    Fill: ['LinearGradient', 'RadialGradient', 'Pattern'],
    Clipping: ['ClipPath', 'ChartClipPath', 'CircleClipPath', 'RectClipPath'],
    Other: ['Blur', 'Bounds', 'ColorRamp', 'MotionPath'],
  };

  const utils = ['pivot'];
  const tools = ['GeojsonPreview', 'TopojsonPreview', 'ShapefilePreview'];
  const performance = [
    'wide_data',
    'wide_data_processed',
    'series_arrays',
    'dimension_arrays',
    'dimension_arrays_processed',
    'streaming',
  ];
</script>

<NavItem text="Home" icon={mdiHome} currentUrl={page.url} path="/" />
<NavItem
  text="Getting Started"
  icon={mdiPlayCircle}
  currentUrl={page.url}
  path="/getting-started"
/>
<NavItem
  text="Changelog"
  icon={mdiFormatListBulleted}
  currentUrl={page.url}
  path="https://github.com/techniq/layerchart/releases"
  target="_blank"
/>

<!-- <h1>Charts</h1>
{#each Object.entries(charts) as [header, items]}
  <h2>{header}</h2>
  {#each items as item}
    {@const label = typeof item === 'object' ? item.label : item}
    {@const pathValue = typeof item === 'object' ? item.value : item}
    <NavItem
      text={label}
      currentUrl={page.url}
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
      currentUrl={page.url}
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
      currentUrl={page.url}
      path="/docs/components/{pathValue}"
      class="pl-6 py-2"
    />
  {/each}
{/each}

<h1>Utils</h1>
{#each utils as item}
  <NavItem text={item} currentUrl={page.url} path="/docs/utils/{item}" class="pl-6 py-2" />
{/each}

<h1>Tools</h1>
{#each tools as item}
  <NavItem
    text={item.replace(/([a-z])([A-Z])/g, '$1 $2')}
    currentUrl={page.url}
    path="/docs/tools/{item}"
    class="pl-6 py-2"
  />
{/each}

<h1>Performance</h1>
{#each performance as item}
  <NavItem
    text={item.replace(/([a-z])([A-Z])/g, '$1 $2')}
    currentUrl={page.url}
    path="/docs/performance/{item}"
    class="pl-6 py-2"
  />
{/each}
