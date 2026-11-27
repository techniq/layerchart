<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import { geoIdentity } from 'd3-geo';
  import {
    Area,
    Chart,
    ChartClipPath,
    Circle,
    CircleClipPath,
    ClipPath,
    GeoClipPath,
    Rect,
    RectClipPath,
    Text,
    WebGL,
  } from '../../index.js';
  import ThrelteProbe from './ThrelteProbe.svelte';

  let {
    clip,
    disabled = false,
    invert = false,
    full = false,
    padding,
    onThrelte,
  }: {
    clip:
      | 'rect'
      | 'circle'
      | 'path'
      | 'snippet'
      | 'elements'
      | 'geo'
      | 'chart'
      | 'labels'
      | 'crossing';
    disabled?: boolean;
    invert?: boolean;
    full?: boolean;
    padding?: { left?: number; top?: number; right?: number; bottom?: number };
    onThrelte: ComponentProps<typeof ThrelteProbe>['onThrelte'];
  } = $props();

  // A square 100 pixels across, from the plot's center (where the projection puts `(0, 0)`)
  const square = {
    type: 'Polygon' as const,
    coordinates: [
      [
        [0, 0],
        [0, 100],
        [100, 100],
        [100, 0],
        [0, 0],
      ],
    ],
  };
</script>

{#snippet fill()}
  <!-- Past the plot on every side, into any padding -->
  <Rect x={-100} y={-100} width={600} height={500} fill="red" />
{/snippet}

<div style="width: 400px; height: 300px; pointer-events: none">
  <Chart
    {padding}
    {...clip === 'crossing' ? { xDomain: [0, 1], yDomain: [-10, 10] } : {}}
    geo={clip === 'geo' ? { projection: geoIdentity as any } : undefined}
  >
    {#snippet children({ context }: { context: ChartState<any> })}
      <WebGL clip={false}>
        {#if clip === 'rect'}
          <RectClipPath x={0} y={0} width={100} height={100} {disabled} {invert}>
            {@render fill()}
          </RectClipPath>
        {:else if clip === 'circle'}
          <CircleClipPath cx={200} cy={150} r={50} {disabled} {invert}>
            {@render fill()}
          </CircleClipPath>
        {:else if clip === 'path'}
          <!-- A triangle: its top left half of the plot -->
          <ClipPath path={`M0,0 L${context.width},0 L0,${context.height} Z`} {disabled} {invert}>
            {@render fill()}
          </ClipPath>
        {:else if clip === 'snippet'}
          <!-- Its shape drawn by marks: a square, and a circle at the plot's center -->
          <ClipPath {disabled}>
            {#snippet clip()}
              <Rect x={0} y={0} width={100} height={100} />
              <Circle cx={200} cy={150} r={50} />
            {/snippet}
            {@render fill()}
          </ClipPath>
        {:else if clip === 'elements'}
          <!-- Its shape drawn by SVG elements, as in an `Svg` layer -->
          <ClipPath {disabled}>
            {#snippet clip()}
              <rect x="0" y="0" width="100" height="100" />
              <circle cx="200" cy="150" r="50" />
              <!-- Over the circle's middle (drawn the other way round): still inside -->
              <rect x="190" y="140" width="20" height="20" />
            {/snippet}
            {@render fill()}
          </ClipPath>
        {:else if clip === 'geo'}
          <GeoClipPath geojson={square} {disabled} {invert}>
            {@render fill()}
          </GeoClipPath>
        {:else if clip === 'chart'}
          <ChartClipPath {disabled} {full}>
            {@render fill()}
          </ChartClipPath>
        {:else if clip === 'crossing'}
          <!-- Above its zero baseline, then below it -->
          <Area
            data={[
              { x: 0, y: 10 },
              { x: 1, y: -10 },
            ]}
            x="x"
            y="y"
            y0={() => 0}
            fill="red"
            line={false}
          />
        {:else if clip === 'labels'}
          <!-- The same text twice, sharing its painting, one clipped away and one not -->
          <RectClipPath x={300} y={0} width={10} height={10}>
            <Text x={100} y={150} value="shared" class="text-[40px]" fill="red" />
          </RectClipPath>
          <Text x={100} y={250} value="shared" class="text-[40px]" fill="red" />
        {/if}
        <ThrelteProbe {onThrelte} />
      </WebGL>
    {/snippet}
  </Chart>
</div>
