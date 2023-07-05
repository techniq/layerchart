<script lang="ts">
  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Preview from '$lib/docs/Preview.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Frame from '$lib/components/Frame.svelte';
  import LinearGradient from '$lib/components/LinearGradient.svelte';
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={[]}
      x="x"
      xDomain={[0, 100]}
      y="y"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Frame class="fill-red-50" />
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>full</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={[]}
      x="x"
      xDomain={[0, 100]}
      y="y"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Frame class="fill-red-50" full />
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>border</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={[]}
      x="x"
      xDomain={[0, 100]}
      y="y"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Frame class="stroke-gray-400 fill-none" />
        <Axis placement="bottom" />
        <Axis placement="left" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>gradient background</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={[]}
      x="x"
      xDomain={[0, 100]}
      y="y"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <LinearGradient id="gradient" from to class="from-blue-400 to-emerald-400" vertical />
        <Frame class="stroke-blue-500" fill="url(#gradient)" />
        <Axis placement="bottom" />
        <Axis placement="left" />
      </Svg>
    </Chart>
  </div>
</Preview>
