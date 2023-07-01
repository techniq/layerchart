<script lang="ts">
  import { scaleOrdinal } from 'd3-scale';
  import { format } from 'date-fns';
  import { sum } from 'd3-array';
  import { format as formatUtil } from 'svelte-ux';

  import { ApiDocs } from 'svelte-ux';

  import api from '$lib/components/Pie.svelte?raw&sveld';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Arc from '$lib/components/Arc.svelte';
  import Pie from '$lib/components/Pie.svelte';
  import Text from '$lib/components/Text.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData';

  const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
  const data2 = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

  $: dataSum = sum(data, (d) => d.value);

  const colorKeys = [...new Set(data.map((d) => d.date))];
  const keyColors = [
    'var(--color-blue-500)',
    'var(--color-green-500)',
    'var(--color-purple-500)',
    'var(--color-orange-500)'
  ];
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Partial range (Chart xRange)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="value"
      xRange={[-90, 90]}
      r="date"
      rScale={scaleOrdinal()}
      rDomain={colorKeys}
      rRange={keyColors}
    >
      <Svg>
        <Pie />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Partial range (range prop)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie range={[-90, 90]} color="var(--color-blue-500)" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Pad angle</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie padAngle={0.05} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Pad angle</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie innerRadius={100} padAngle={0.03} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Inner radius</h2>

<h3>If value >= 1, value will be treated as discrete</h3>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie innerRadius={100} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h3>If value >= 0 and less than 1, value will be treated as a percentage of outerRadius</h3>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie innerRadius={0.9} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h3>If value less than 0, value will be treated as a offset of outerRadius</h3>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie innerRadius={-30} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Outer radius</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie outerRadius={100} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Multiple (data prop)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie innerRadius={100} {data} />
        <Pie outerRadius={90} data={data2} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Tweened</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie tweened />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Offset</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie offset={4} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>default slot / render each `Arc`</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
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

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart {data} x="value" r="date" rScale={scaleOrdinal()} rDomain={colorKeys} rRange={keyColors}>
      <Svg>
        <Pie let:arcs>
          {#each arcs as arc, index}
            <Arc
              startAngle={arc.startAngle}
              endAngle={arc.endAngle}
              padAngle={arc.padAngle}
              fill={keyColors[index]}
              let:centroid
            >
              <Text
                value={formatUtil(data[index].value / dataSum, 'percent')}
                x={centroid[0]}
                y={centroid[1]}
                dy={-8}
                textAnchor="middle"
                verticalAnchor="middle"
                class="text-lg"
              />
              <Text
                value={data[index].value}
                x={centroid[0]}
                y={centroid[1]}
                dy={8}
                textAnchor="middle"
                verticalAnchor="middle"
                class="text-sm fill-black/50"
              />
            </Arc>
          {/each}
        </Pie>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Tooltip</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="value"
      r="date"
      rScale={scaleOrdinal()}
      rDomain={colorKeys}
      rRange={keyColors}
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        <Pie {tooltip} />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} format="integer" valueAlign="right" />
        <TooltipItem
          label="percent"
          value={data.value / dataSum}
          format="percent"
          valueAlign="right"
        />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h1>API</h1>

<ApiDocs {api} />
