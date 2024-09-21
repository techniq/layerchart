<script lang="ts">
  import { scaleOrdinal } from 'd3-scale';
  import { format } from 'date-fns';
  import { sum } from 'd3-array';
  import { cls } from '@layerstack/tailwind';
  import { format as formatUtil } from '@layerstack/utils';

  import { Arc, Chart, Group, Pie, Svg, Text, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
  const data2 = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

  $: dataSum = sum(data, (d) => d.value);

  const colorKeys = [...new Set(data.map((d) => d.date))];
  const keyColors = [
    'hsl(var(--color-info))',
    'hsl(var(--color-success))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-danger))',
  ];

  const keyClasses = [
    { shape: 'fill-info', content: 'fill-info-content' },
    { shape: 'fill-success', content: 'fill-success-content' },
    { shape: 'fill-warning', content: 'fill-warning-content' },
    { shape: 'fill-danger', content: 'fill-danger-content' },
  ];
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Partial range (Chart xRange)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" xRange={[-90, 90]} c="date" cRange={keyColors}>
      <Svg center>
        <Pie />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Partial range (range prop)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie range={[-90, 90]} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Pad angle</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie padAngle={0.05} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Pad angle</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie innerRadius={100} padAngle={0.03} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Inner radius</h2>

<h3>If value >= 1, value will be treated as discrete</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie innerRadius={100} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h3>If value >= 0 and less than 1, value will be treated as a percentage of outerRadius</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie innerRadius={0.9} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h3>If value less than 0, value will be treated as a offset of outerRadius</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie innerRadius={-30} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Outer radius</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie outerRadius={100} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Multiple (data prop)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie innerRadius={100} {data} />
        <Pie outerRadius={90} data={data2} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Tweened</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie tweened />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Offset</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie offset={4} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>default slot / render each `Arc`</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie let:arcs>
          {#each arcs as arc, index}
            <Arc
              startAngle={arc.startAngle}
              endAngle={arc.endAngle}
              padAngle={arc.padAngle}
              fill={keyColors[index]}
              offset={index === 0 ? 16 : 0}
            />
          {/each}
        </Pie>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Centroid labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date">
      <Svg center>
        <Pie let:arcs>
          {#each arcs as arc, index}
            {@const colors = keyClasses[index]}
            <Arc
              startAngle={arc.startAngle}
              endAngle={arc.endAngle}
              padAngle={arc.padAngle}
              class={colors.shape}
              let:centroid
            >
              <Text
                value={formatUtil(arc.data.value / dataSum, 'percent')}
                x={centroid[0]}
                y={centroid[1]}
                dy={-8}
                textAnchoc="middle"
                verticalAnchoc="middle"
                class={cls('text-base', colors.content)}
              />
              <Text
                value={arc.data.value}
                x={centroid[0]}
                y={centroid[1]}
                dy={8}
                textAnchoc="middle"
                verticalAnchoc="middle"
                class={cls('text-sm opacity-50', colors.content)}
              />
            </Arc>
          {/each}
        </Pie>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Tooltip</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors} let:tooltip>
      <Svg center>
        <Pie {tooltip} />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} format="integer" valueAlign="right" />
          <Tooltip.Item
            label="percent"
            value={data.value / dataSum}
            format="percent"
            valueAlign="right"
          />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Tooltip with Arcs (slot)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors} let:tooltip>
      <Svg center>
        <Pie let:arcs>
          {#each arcs as arc, index}
            {@const colors = keyClasses[index]}
            {@const isHighlighted = tooltip.data?.date === arc.data.date}
            {@const isFaded = tooltip.data != null && tooltip.data.date !== arc.data.date}
            <Group
              on:pointerenter={(e) => tooltip?.show(e, arc.data)}
              on:pointermove={(e) => tooltip?.show(e, arc.data)}
              on:pointerleave={(e) => tooltip?.hide()}
              preventTouchMove
              class={cls(
                // isHighlighted && 'stroke-surface-content stroke-2',
                isFaded && 'opacity-50'
              )}
            >
              <Arc
                startAngle={arc.startAngle}
                endAngle={arc.endAngle}
                padAngle={arc.padAngle}
                class={colors.shape}
                _offset={isHighlighted ? 16 : 0}
                let:centroid
              >
                <Text
                  value={formatUtil(arc.data.value / dataSum, 'percent')}
                  x={centroid[0]}
                  y={centroid[1]}
                  textAnchoc="middle"
                  verticalAnchoc="middle"
                  class={cls('text-base', colors.content)}
                />
              </Arc>
            </Group>
          {/each}
        </Pie>
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} format="integer" valueAlign="right" />
          <Tooltip.Item
            label="percent"
            value={data.value / dataSum}
            format="percent"
            valueAlign="right"
          />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Placement</h2>

<h3>left</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors} let:height>
      <Svg>
        <Group x={height / 2} center="y">
          <Pie />
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>

<h3>center</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Svg center>
        <Pie />
      </Svg>
    </Chart>
  </div>
</Preview>

<h3>right</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" c="date" cRange={keyColors} let:width let:height>
      <Svg>
        <Group x={width - height / 2} center="y">
          <Pie />
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>
