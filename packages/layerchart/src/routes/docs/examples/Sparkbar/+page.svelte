<script lang="ts">
  import { format } from 'date-fns';

  import { BarChart, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';

  const data = createDateSeries({
    count: 30,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
  const negativeData = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });

  let renderContext = $derived(shared.renderContext as 'svg' | 'canvas');
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="w-[124px] h-[18px]">
    <BarChart
      {data}
      x="date"
      y="value"
      axis={false}
      grid={false}
      bandPadding={0.1}
      props={{ bars: { radius: 1, strokeWidth: 0 } }}
      {renderContext}
    />
  </div>
</Preview>

<h2>Basic within a paragraph</h2>
<Preview {data}>
  <div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
      ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
      <span class="w-[124px] h-[18px] inline-block">
        <BarChart
          {data}
          x="date"
          y="value"
          axis={false}
          grid={false}
          bandPadding={0.1}
          props={{ bars: { radius: 1, strokeWidth: 0 } }}
          {renderContext}
        />
      </span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis
      nibh volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
    </p>
  </div>
</Preview>

<h2>Basic negative data</h2>

<Preview data={negativeData}>
  <div class="w-[124px] h-[18px]">
    <BarChart
      data={negativeData}
      x="date"
      y="value"
      axis={false}
      grid={false}
      bandPadding={0.1}
      props={{ bars: { radius: 1, strokeWidth: 0 } }}
      {renderContext}
    />
  </div>
</Preview>

<h2>Fixed position tooltip</h2>

<Preview {data}>
  <div class="w-[124px] h-[18px]">
    <BarChart
      {data}
      x="date"
      y="value"
      axis={false}
      grid={false}
      bandPadding={0.1}
      props={{ bars: { radius: 1, strokeWidth: 0 } }}
      {renderContext}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root
          {context}
          class="text-xs"
          contained={false}
          variant="none"
          y={-10}
          x={context.width + 8}
        >
          {#snippet children({ data })}
            <div class="whitespace-nowrap">
              {format(data.date, 'eee, MMM do')}
            </div>
            <div class="font-semibold">
              {data.value}
            </div>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Basic within a paragraph with Tooltip and Highlight</h2>
<Preview {data}>
  <div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
      ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
      <span class="w-[124px] h-[18px] inline-block">
        <BarChart
          {data}
          x="date"
          y="value"
          axis={false}
          grid={false}
          bandPadding={0.1}
          props={{ bars: { radius: 1, strokeWidth: 0 } }}
          {renderContext}
        >
          {#snippet tooltip({ context })}
            <Tooltip.Root
              {context}
              class="text-xs"
              contained={false}
              y={context.height + 4}
              xOffset={0}
            >
              {#snippet children({ data })}
                <Tooltip.Header>{format(data.date, 'eee, MMM do')}</Tooltip.Header>
                <Tooltip.List>
                  <Tooltip.Item label="value" value={data.value} />
                </Tooltip.List>
              {/snippet}
            </Tooltip.Root>
          {/snippet}
        </BarChart>
      </span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis
      nibh volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
    </p>
  </div>
</Preview>
