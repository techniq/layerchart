<script lang="ts">
  import { curveLinearClosed, curveCatmullRomClosed } from 'd3-shape';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Group from '$lib/components/Group.svelte';
  import Spline from '$lib/components/Spline.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import AxisRadial from './AxisRadial.svelte';
  import { pivotLonger } from '$lib/utils/pivot';

  const data = [{ name: 'Pitcher', fastball: 10, change: 0, slider: 4, cutter: 8, curve: 5 }];

  const xKey = ['fastball', 'change', 'slider', 'cutter', 'curve'];
  const longData = pivotLonger(data, xKey, 'pitch', 'value');
  // $: console.log({ data, longData });

  $: angleSlice = (Math.PI * 2) / xKey.length;

  /**
   * TODO:
   *  - [ ] Tooltip (manual with path, radial bisect?).  Work with Highlight
   */
</script>

<h1>Examples</h1>

<h2>Straight</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x={xKey}
      xDomain={[0, 10]}
      xRange={({ height }) => [0, height / 2]}
      padding={{ top: 32, bottom: 8 }}
      let:xGet
    >
      <Svg>
        <AxisRadial />

        <Group center>
          {#each data as d}
            <Spline
              data={xGet(d)}
              curve={curveLinearClosed}
              x={(d, i) => d * Math.cos(angleSlice * i - Math.PI / 2)}
              y={(d, i) => d * Math.sin(angleSlice * i - Math.PI / 2)}
              class="fill-primary/20 stroke-primary stroke-2"
            />

            {#each xGet(d) as circleR, i}
              {@const thisAngleSlice = angleSlice * i - Math.PI / 2}
              <circle
                cx={circleR * Math.cos(thisAngleSlice)}
                cy={circleR * Math.sin(thisAngleSlice)}
                r={5}
                class="fill-primary stroke-surface-200"
              ></circle>
            {/each}
          {/each}
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Curved</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x={xKey}
      xDomain={[0, 10]}
      xRange={({ height }) => [0, height / 2]}
      padding={{ top: 32, bottom: 8 }}
      let:xGet
    >
      <Svg>
        <AxisRadial />

        <Group center>
          {#each data as d}
            <Spline
              data={xGet(d)}
              curve={curveCatmullRomClosed}
              x={(d, i) => d * Math.cos(angleSlice * i - Math.PI / 2)}
              y={(d, i) => d * Math.sin(angleSlice * i - Math.PI / 2)}
              class="fill-primary/20 stroke-primary stroke-2"
            />

            {#each xGet(d) as circleR, i}
              {@const thisAngleSlice = angleSlice * i - Math.PI / 2}
              <circle
                cx={circleR * Math.cos(thisAngleSlice)}
                cy={circleR * Math.sin(thisAngleSlice)}
                r={5}
                class="fill-primary stroke-surface-200"
              ></circle>
            {/each}
          {/each}
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>
