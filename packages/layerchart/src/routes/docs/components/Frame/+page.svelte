<script lang="ts">
  import { Axis, Canvas, Chart, Frame, LinearGradient, Svg } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
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
        <Frame class="fill-danger/5" />
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
        <Frame class="fill-danger/5" full />
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
        <LinearGradient class="from-primary/10 to-secondary/10" vertical let:gradient>
          <Frame class="stroke-primary/10" fill={gradient} />
        </LinearGradient>
        <Axis placement="bottom" />
        <Axis placement="left" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

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
      <Canvas>
        <Frame class="fill-danger/5" />
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
      </Canvas>
    </Chart>
  </div>
</Preview>

<h2>Canvas gradient background</h2>

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
      <Canvas>
        <LinearGradient class="from-primary/10 to-secondary/10" vertical let:gradient>
          <Frame class="stroke-primary/10" fill={gradient} />
        </LinearGradient>
        <Axis placement="bottom" />
        <Axis placement="left" />
      </Canvas>
    </Chart>
  </div>
</Preview>
