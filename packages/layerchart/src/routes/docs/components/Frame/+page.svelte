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
        <Frame class="fill-error/5" />
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
        <Frame class="fill-error/5" full />
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
        <Frame class="stroke-surface-content/50 fill-none" />
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
        <LinearGradient class="from-primary/10 to-secondary/10" vertical let:url>
          <Frame class="stroke-primary/10" fill={url} />
        </LinearGradient>
        <Axis placement="bottom" />
        <Axis placement="left" />
      </Svg>
    </Chart>
  </div>
</Preview>
