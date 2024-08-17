<script lang="ts">
  import { Axis, Highlight, Points, ScatterChart, Svg, Tooltip } from 'layerchart';
  import { format } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { getSpiral } from '$lib/utils/genData.js';

  const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart {data} x="x" y="y" />
  </div>
</Preview>

<h2>Labels</h2>

<Preview {data}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart {data} x="x" y="y" labels={{ offset: 10 }} />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview {data}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart {data} x="x" y="y">
      <svelte:fragment slot="tooltip" let:x let:y>
        <Tooltip.Root let:data>
          <Tooltip.Header>{format(x(data), 'integer')}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="value" value={format(y(data), 'integer')} />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </ScatterChart>
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview {data}>
  <div class="h-[400px] p-4 border rounded">
    <ScatterChart {data} x="x" y="y" let:x let:y>
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" grid rule />
        <Points class="fill-primary/10 stroke-primary" />
        <Highlight points lines />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data), 'integer')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={format(y(data), 'integer')} />
        </Tooltip.List>
      </Tooltip.Root>
    </ScatterChart>
  </div>
</Preview>
