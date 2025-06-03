<script lang="ts">
  import { Chart, Layer, Polygon } from 'layerchart';
  import { RangeField } from 'svelte-ux';
  import Preview from 'layerchart/docs/Preview.svelte';

  let points = $state(8);
  let curveRadius = $state(0);
  let inset = $state(0.3);
  let rotate = $state(0);
  let scaleX = $state(1);
  let scaleY = $state(1);
  let skewX = $state(0);
  let skewY = $state(0);
  let tiltX = $state(1);
  let tiltY = $state(1);
</script>

<h1>Playground</h1>

<div class="grid grid-cols-xs gap-2 mb-2">
  <RangeField label="points" bind:value={points} min={3} max={20} />
  <RangeField label="inset" bind:value={inset} min={0.1} max={2} step={0.1} format="decimal" />
  <RangeField label="rotate" bind:value={rotate} max={360} />
  <RangeField label="curveRadius" bind:value={curveRadius} max={50} />
  <RangeField label="scaleX" bind:value={scaleX} min={-2} max={2} step={0.1} format="decimal" />
  <RangeField label="scaleY" bind:value={scaleY} min={-2} max={2} step={0.1} format="decimal" />
  <RangeField label="skewX" bind:value={skewX} min={-50} max={50} />
  <RangeField label="skewY" bind:value={skewY} min={-50} max={50} />
  <RangeField label="tiltX" bind:value={tiltX} min={-2} max={2} step={0.1} format="decimal" />
  <RangeField label="tiltY" bind:value={tiltY} min={-2} max={2} step={0.1} format="decimal" />
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
          {tiltX}
          {tiltY}
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
    <h3>Trapezoid</h3>
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
                tiltX={2}
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

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Stars</h2>
  <RangeField
    label="inset"
    labelPlacement="left"
    bind:value={inset}
    max={2}
    step={0.1}
    format="decimal"
  />
  <RangeField label="rotate" labelPlacement="left" bind:value={rotate} max={360} />
  <RangeField label="curveRadius" labelPlacement="left" bind:value={curveRadius} max={50} />
</div>

<div class="grid grid-cols-sm gap-3">
  {#each [6, 8, 10, 12, 14, 16, 18, 20] as points}
    <div>
      <h3>{points} point</h3>
      <Preview>
        <div class="h-[150px] p-4 border rounded-sm">
          <Chart>
            <Layer type="svg">
              <Polygon cx={50} cy={50} r={50} {points} {inset} {rotate} {curveRadius} />
            </Layer>
          </Chart>
        </div>
      </Preview>
    </div>
  {/each}
</div>
