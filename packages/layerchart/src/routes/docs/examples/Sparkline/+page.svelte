<script lang="ts">
  import { format } from 'date-fns';

  import { LineChart, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const data = createDateSeries({ count: 50, min: 50, max: 100, value: 'integer' });
</script>

<h1>Examples</h1>

<h2>Basic</h2>
<Preview {data}>
  <div>
    <div class="w-[124px] h-[18px]">
      <LineChart {data} x="date" y="value" yDomain={null} axis={false} grid={false} />
    </div>
  </div>
</Preview>

<h2>Basic within a paragraph</h2>
<Preview {data}>
  <div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
      ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
      <span class="w-[124px] h-[18px] inline-block">
        <LineChart {data} x="date" y="value" yDomain={null} axis={false} grid={false} />
      </span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis
      nibh volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
    </p>
  </div>
</Preview>

<h2>Basic zero axis</h2>
<Preview {data}>
  <div class="w-[124px] h-[20px] inline-block">
    <LineChart {data} x="date" y="value" axis={false} grid={false} />
  </div>
</Preview>

<h2>Fixed position tooltip</h2>
<Preview {data}>
  <div class="w-[124px] h-[24px]">
    <LineChart
      {data}
      x="date"
      y="value"
      yDomain={null}
      axis={false}
      grid={false}
      props={{
        highlight: { points: { r: 3, class: 'stroke-none' } },
      }}
    >
      {#snippet tooltip({ context, tooltipContext })}
        <Tooltip.Root class="text-xs" contained={false} y={-3} x={context.width + 8} variant="none">
          <div class="whitespace-nowrap">
            {format(tooltipContext.data.date, 'eee, MMM do')}
          </div>
          <div class="font-semibold">
            {tooltipContext.data.value}
          </div>
        </Tooltip.Root>
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Within a paragraph with Tooltip and Highlight</h2>
<Preview {data}>
  <div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
      ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
      <span class="w-[124px] h-[18px] inline-block">
        <LineChart
          {data}
          x="date"
          y="value"
          yDomain={null}
          axis={false}
          grid={false}
          props={{
            highlight: { points: { r: 3, class: 'stroke-none' } },
          }}
        >
          {#snippet tooltip({ context, tooltipContext })}
            <Tooltip.Root class="text-xs" contained={false} y={context.height + 4} xOffset={0}>
              <div class="whitespace-nowrap">
                {format(tooltipContext.data.date, 'eee, MMM do')}
              </div>
              <div class="font-semibold">
                {tooltipContext.data.value}
              </div>
            </Tooltip.Root>
          {/snippet}
        </LineChart>
      </span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis
      nibh volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
    </p>
  </div>
</Preview>
