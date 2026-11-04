<script lang="ts">
  import Chart from './../Chart/Chart.svelte';
  import Svg from './../layers/Svg.svelte';
  import Html from './../layers/Html.svelte';
  import Axis from './../Axis/Axis.svelte';
  import Circle from './../Circle/Circle.svelte';
  import Ellipse from './../Ellipse/Ellipse.svelte';
  import Line from './../Line/Line.svelte';
  import Polygon from './../Polygon/Polygon.svelte';
  import Rect from './../Rect/Rect.svelte';
  import Text from './../Text/Text.svelte';

  let { layer, data, ...props } = $props();
</script>

<Chart {data} {...props}>
  {#if layer === 'svg'}
    <Svg>
      <Axis placement="left" />
      <Circle {data} cx="x" cy="y" r={2} />
      <Ellipse {data} cx="x" cy="y" rx={2} ry={3} />
      <Line {data} x1="x" y1="y" x2="x" y2={0} />
      <Polygon {data} cx="x" cy="y" r={3} points={5} />
      <Rect {data} x="x" y="y" width={2} height={2} />
      <Text {data} x="x" y="y" value="y" />
    </Svg>
  {:else}
    <Html>
      <Circle {data} cx="x" cy="y" r={2} />
      <Ellipse {data} cx="x" cy="y" rx={2} ry={3} />
      <Rect {data} x="x" y="y" width={2} height={2} />
      <Text {data} x="x" y="y" value="y" />
    </Html>
  {/if}
</Chart>
