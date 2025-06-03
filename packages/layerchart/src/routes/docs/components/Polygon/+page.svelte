<script lang="ts">
  import { Chart, Layer, Polygon } from 'layerchart';
  import { RangeField } from 'svelte-ux';
  import Preview from 'layerchart/docs/Preview.svelte';

  let points = $state(10);
  let curveRadius = $state(0);
  let inset = $state(0.3);
  let rotate = $state(0);
  let scaleX = $state(1);
  let scaleY = $state(1);
  let skewX = $state(0);
  let skewY = $state(0);

  const simpleExamples = [
    { label: 'Triangle', points: 3 },
    { label: 'Square / Diamond', points: 4 },
    { label: 'Pentagon', points: 5 },
    { label: 'Hexagon', points: 6 },
    { label: 'Octagon', points: 8 },
  ];

  const starExamples = [
    { label: '6 point', points: 6 },
    { label: '8 point', points: 8 },
    { label: '10 point', points: 10 },
    { label: '12 point', points: 12 },
    { label: '14 point', points: 14 },
    { label: '16 point', points: 16 },
    { label: '18 point', points: 18 },
    { label: '20 point', points: 20 },
  ];
</script>

<h1>Playground</h1>

<div class="grid grid-cols-xs gap-2 mb-2">
  <RangeField label="points" bind:value={points} min={3} max={20} />
  <RangeField label="inset" bind:value={inset} max={2} step={0.1} />
  <RangeField label="rotate" bind:value={rotate} max={360} />
  <RangeField label="curveRadius" bind:value={curveRadius} max={50} />
  <RangeField label="scaleX" bind:value={scaleX} max={2} step={0.1} />
  <RangeField label="scaleY" bind:value={scaleY} max={2} step={0.1} />
  <RangeField label="skewX" bind:value={skewX} min={-50} max={50} />
  <RangeField label="skewY" bind:value={skewY} min={-50} max={50} />
</div>

<div class="h-[300px] p-4 border rounded-sm">
  <Chart>
    {#snippet children({ context })}
      <Layer type="svg">
        <Polygon
          cx={context.width / 2}
          cy={context.height / 2}
          r={100}
          {points}
          {inset}
          {rotate}
          {curveRadius}
          {scaleX}
          {scaleY}
          {skewX}
          {skewY}
        />
      </Layer>
    {/snippet}
  </Chart>
</div>

<h1>Examples</h1>

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Simple</h2>
  <RangeField label="rotate" labelPlacement="left" bind:value={rotate} max={360} />
  <RangeField label="curveRadius" labelPlacement="left" bind:value={curveRadius} max={50} />
</div>

<div class="grid grid-cols-sm gap-3">
  <div>
    <h3>Triangle</h3>
    <Preview>
      <div class="h-[150px] p-4 border rounded-sm">
        <Chart>
          {#snippet children({ context })}
            <Layer type="svg">
              <Polygon
                cx={context.width / 2}
                cy={context.height / 2}
                r={60}
                points={3}
                {rotate}
                {curveRadius}
              />
            </Layer>
          {/snippet}
        </Chart>
      </div>
    </Preview>
  </div>

  <div>
    <h3>Square</h3>
    <Preview>
      <div class="h-[150px] p-4 border rounded-sm">
        <Chart>
          {#snippet children({ context })}
            <Layer type="svg">
              <Polygon
                cx={context.width / 2}
                cy={context.height / 2}
                r={60}
                points={4}
                rotate={rotate + 45}
                {curveRadius}
              />
            </Layer>
          {/snippet}
        </Chart>
      </div>
    </Preview>
  </div>

  <div>
    <h3>Diamond</h3>
    <Preview>
      <div class="h-[150px] p-4 border rounded-sm">
        <Chart>
          {#snippet children({ context })}
            <Layer type="svg">
              <Polygon
                cx={context.width / 2}
                cy={context.height / 2}
                r={60}
                points={4}
                scaleX={0.5}
                {rotate}
                {curveRadius}
              />
            </Layer>
          {/snippet}
        </Chart>
      </div>
    </Preview>
  </div>

  <div>
    <h3>Rhombus</h3>
    <Preview>
      <div class="h-[150px] p-4 border rounded-sm">
        <Chart>
          {#snippet children({ context })}
            <Layer type="svg">
              <Polygon
                cx={context.width / 2}
                cy={context.height / 2}
                r={60}
                points={4}
                skewX={-20}
                rotate={rotate + 45}
                {curveRadius}
              />
            </Layer>
          {/snippet}
        </Chart>
      </div>
    </Preview>
  </div>

  <div>
    <h3>Parallelogram</h3>
    <Preview>
      <div class="h-[150px] p-4 border rounded-sm">
        <Chart>
          {#snippet children({ context })}
            <Layer type="svg">
              <Polygon
                cx={context.width / 2}
                cy={context.height / 2}
                r={60}
                points={4}
                skewX={-20}
                scaleX={1.5}
                rotate={rotate + 45}
                {curveRadius}
              />
            </Layer>
          {/snippet}
        </Chart>
      </div>
    </Preview>
  </div>

  <div>
    <h3>Pentagon</h3>
    <Preview>
      <div class="h-[150px] p-4 border rounded-sm">
        <Chart>
          {#snippet children({ context })}
            <Layer type="svg">
              <Polygon
                cx={context.width / 2}
                cy={context.height / 2}
                r={60}
                points={5}
                {rotate}
                {curveRadius}
              />
            </Layer>
          {/snippet}
        </Chart>
      </div>
    </Preview>
  </div>

  <div>
    <h3>Hexagon</h3>
    <Preview>
      <div class="h-[150px] p-4 border rounded-sm">
        <Chart>
          {#snippet children({ context })}
            <Layer type="svg">
              <Polygon
                cx={context.width / 2}
                cy={context.height / 2}
                r={60}
                points={6}
                {rotate}
                {curveRadius}
              />
            </Layer>
          {/snippet}
        </Chart>
      </div>
    </Preview>
  </div>

  <div>
    <h3>Octagon</h3>
    <Preview>
      <div class="h-[150px] p-4 border rounded-sm">
        <Chart>
          {#snippet children({ context })}
            <Layer type="svg">
              <Polygon
                cx={context.width / 2}
                cy={context.height / 2}
                r={60}
                points={8}
                {rotate}
                {curveRadius}
              />
            </Layer>
          {/snippet}
        </Chart>
      </div>
    </Preview>
  </div>

  <div>
    <h3>Octagon</h3>
    <Preview>
      <div class="h-[150px] p-4 border rounded-sm">
        <Chart>
          {#snippet children({ context })}
            <Layer type="svg">
              <Polygon
                cx={context.width / 2}
                cy={context.height / 2}
                r={60}
                points={8}
                {rotate}
                {curveRadius}
              />
            </Layer>
          {/snippet}
        </Chart>
      </div>
    </Preview>
  </div>
</div>

<h2>Stars</h2>

<div class="flex gap-2 mb-1/2">
  <RangeField label="inset" labelPlacement="left" bind:value={inset} max={2} step={0.1} />
  <RangeField label="rotate" labelPlacement="left" bind:value={rotate} max={360} />
  <RangeField label="curveRadius" labelPlacement="left" bind:value={curveRadius} max={50} />
</div>

<div class="grid grid-cols-sm gap-3">
  {#each starExamples as example}
    <div>
      <h3>{example.label}</h3>
      <Preview>
        <div class="h-[150px] p-4 border rounded-sm">
          <Chart>
            <Layer type="svg">
              <Polygon
                cx={50}
                cy={50}
                r={50}
                points={example.points}
                {inset}
                {rotate}
                {curveRadius}
              />
            </Layer>
          </Chart>
        </div>
      </Preview>
    </div>
  {/each}
</div>
