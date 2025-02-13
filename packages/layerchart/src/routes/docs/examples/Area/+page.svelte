<script lang="ts">
  import { cubicInOut } from 'svelte/easing';
  import { scaleOrdinal, scaleTime } from 'd3-scale';
  import { flatGroup } from 'd3-array';
  import { stack } from 'd3-shape';
  import { format as formatDate } from 'date-fns';
  import { flatten } from 'layercake';

  import {
    Area,
    Axis,
    Chart,
    ChartClipPath,
    Highlight,
    Labels,
    LinearGradient,
    Point,
    RectClipPath,
    Rule,
    Spline,
    Svg,
    Text,
    Tooltip,
    chartDataArray,
    pivotLonger,
  } from 'layerchart';
  import { Field, Switch, Toggle } from 'svelte-ux';
  import { format, PeriodType } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  export let data;

  const dateSeriesData = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
  const negativeDateSeriesData = createDateSeries({
    count: 30,
    min: -20,
    max: 50,
    value: 'integer',
  });

  const keys = ['apples', 'bananas', 'oranges'];
  const multiSeriesData = createDateSeries({
    count: 30,
    min: 10,
    max: 100,
    value: 'integer',
    keys,
  });
  const stackData = stack().keys(keys)(multiSeriesData) as any[];
  const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
  const dataByFruit = flatGroup(multiSeriesFlatData, (d) => d.fruit);

  const fruitColors = {
    apples: 'hsl(var(--color-danger))',
    bananas: 'hsl(var(--color-success))',
    oranges: 'hsl(var(--color-info))',
  };
</script>

<h1>Examples</h1>

<Blockquote>
  See also: <a href="/docs/components/AreaChart">AreaChart</a> for simplified examples
</Blockquote>

<h2>Basic</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{formatDate(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>With Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
        <Labels format="integer" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Explicit axis ticks (min/max)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day)}
          rule
          ticks={(scale) => scale.domain()}
        >
          <svelte:fragment slot="tickLabel" let:labelProps let:index>
            <Text {...labelProps} textAnchor={index ? 'end' : 'start'} />
          </svelte:fragment>
        </Axis>
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Gradient</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient>
          <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
        </LinearGradient>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Gradient (separate stroke)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <LinearGradient class="from-secondary/0 to-secondary" let:gradient={strokeGradient}>
          <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient={fillGradient}>
            <Area line={{ stroke: strokeGradient, class: 'stroke-2' }} fill={fillGradient} />
          </LinearGradient>
        </LinearGradient>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Multiple series</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={multiSeriesFlatData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={Object.keys(fruitColors)}
      cRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24, right: 48 }}
      tooltip={{ mode: 'voronoi' }}
      let:cScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        {#each dataByFruit as [fruit, data]}
          {@const color = cScale?.(fruit)}
          <Area {data} fill={color} fillOpacity={0.3} line={{ class: 'stroke-2', stroke: color }} />
          <Point d={data[data.length - 1]} let:x let:y>
            <circle cx={x} cy={y} r={4} fill={color} />
            <Text
              {x}
              {y}
              value={fruit}
              verticalAnchor="middle"
              dx={6}
              dy={-2}
              class="text-xs"
              fill={color}
            />
          </Point>
        {/each}
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{formatDate(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label={data.fruit} value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Multiple series (using overrides)</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={multiSeriesData}
      x="date"
      y={['apples', 'bananas', 'oranges']}
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24, right: 48 }}
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />

        <Area
          y1={(d) => d.apples}
          class="stroke-2"
          fill={fruitColors.apples}
          fillOpacity={0.3}
          line={{ stroke: fruitColors.apples, class: 'stroke-2' }}
        />

        <Area
          y1={(d) => d.bananas}
          class="stroke-2"
          fill={fruitColors.bananas}
          fillOpacity={0.3}
          line={{ stroke: fruitColors.bananas, class: 'stroke-2' }}
        />

        <Area
          y1={(d) => d.oranges}
          class="stroke-2"
          fill={fruitColors.oranges}
          fillOpacity={0.3}
          line={{ stroke: fruitColors.oranges, class: 'stroke-2' }}
        />

        <Highlight y={(d) => d.apples} points={{ fill: fruitColors.apples }} />
        <Highlight y={(d) => d.bananas} points={{ fill: fruitColors.bananas }} />
        <Highlight y={(d) => d.oranges} points={{ fill: fruitColors.oranges }} />
        <Highlight lines />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{formatDate(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="apples" value={data.apples} />
          <Tooltip.Item label="bananas" value={data.bananas} />
          <Tooltip.Item label="oranges" value={data.oranges} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Multiple series (highlight on hover)</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={multiSeriesFlatData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={Object.keys(fruitColors)}
      cRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24, right: 48 }}
      tooltip={{ mode: 'voronoi' }}
      let:tooltip
      let:cScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        {#each dataByFruit as [fruit, data]}
          {@const color =
            tooltip.data == null || tooltip.data.fruit === fruit
              ? cScale?.(fruit)
              : 'hsl(var(--color-surface-content) / 20%)'}
          <Area {data} fill={color} fillOpacity={0.3} line={{ class: 'stroke-2', stroke: color }} />
          <Point d={data[data.length - 1]} let:x let:y>
            <circle cx={x} cy={y} r={4} fill={color} />
            <Text
              {x}
              {y}
              value={fruit}
              verticalAnchor="middle"
              dx={6}
              dy={-2}
              class="text-xs"
              fill={color}
            />
          </Point>
        {/each}
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{formatDate(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label={data.fruit} value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Multiple series with labels</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={multiSeriesFlatData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={Object.keys(fruitColors)}
      cRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'voronoi' }}
      let:cScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        {#each dataByFruit as [fruit, data]}
          {@const color = cScale?.(fruit)}
          <Area {data} fill={color} fillOpacity={0.3} line={{ class: 'stroke-2', stroke: color }} />
        {/each}
        <Labels format="integer" />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{formatDate(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label={data.fruit} value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Stack</h2>

<Preview data={stackData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={stackData}
      flatData={flatten(stackData)}
      x={(d) => d.data.date}
      xScale={scaleTime()}
      y={[0, 1]}
      yNice
      c="key"
      cScale={scaleOrdinal()}
      cDomain={Object.keys(fruitColors)}
      cRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      let:data
      let:cGet
      let:cScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />

        {#each stackData as seriesData}
          {@const color = cGet(seriesData)}
          <Area
            data={seriesData}
            line={{ stroke: color, 'stroke-width': 2 }}
            fill={color}
            fillOpacity={0.2}
          />
        {/each}

        <Highlight points lines />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{formatDate(data.data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          {#each keys as key}
            <Tooltip.Item label={key} value={data.data[key]} color={cScale?.(key)} />
          {/each}
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Stack with gradient</h2>

<Preview data={stackData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={stackData}
      flatData={flatten(stackData)}
      x={(d) => d.data.date}
      xScale={scaleTime()}
      y={[0, 1]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        {@const primaryColors = [
          'hsl(var(--color-danger-500))',
          'hsl(var(--color-success-500))',
          'hsl(var(--color-info-500))',
        ]}
        {@const secondaryColors = [
          'hsl(var(--color-danger-500) / 10%)',
          'hsl(var(--color-success-500) / 10%)',
          'hsl(var(--color-info-500) / 10%)',
        ]}

        {#each chartDataArray(stackData) as seriesData, index}
          {@const primaryColor = primaryColors[index]}
          {@const secondaryColor = secondaryColors[index]}

          <LinearGradient stops={[primaryColor, secondaryColor]} vertical let:gradient>
            <Area
              data={seriesData}
              fill={gradient}
              fillOpacity={0.5}
              line={{ stroke: primaryColor }}
            />
          </LinearGradient>
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Clip tween on mount</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr] gap-2 mb-2">
    <Field label="Show area" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <Preview data={dateSeriesData}>
    <div class="h-[300px] p-4 border rounded">
      <Chart
        data={dateSeriesData}
        x="date"
        xScale={scaleTime()}
        y="value"
        yDomain={[0, null]}
        yNice
        padding={{ left: 16, bottom: 24 }}
      >
        <Svg>
          <Axis placement="left" grid rule />
          <Axis
            placement="bottom"
            format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
            rule
          />
          {#if show}
            <ChartClipPath
              initialWidth={0}
              tweened={{ width: { duration: 1000, easing: cubicInOut } }}
            >
              <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
            </ChartClipPath>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr] gap-2 mb-2">
    <Field label="Show area" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <Preview data={dateSeriesData}>
    <div class="h-[300px] p-4 border rounded">
      <Chart
        data={dateSeriesData}
        x="date"
        xScale={scaleTime()}
        y="value"
        yDomain={[0, null]}
        yNice
        padding={{ left: 16, bottom: 24 }}
      >
        <Svg>
          <Axis placement="left" grid rule />
          <Axis
            placement="bottom"
            format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
            rule
          />
          {#if show}
            <Spline draw={{ easing: cubicInOut, delay: 700 }} class="stroke-2 stroke-primary" />
            <ChartClipPath
              initialWidth={0}
              tweened={{ width: { duration: 1000, easing: cubicInOut } }}
            >
              <Area class="fill-primary/30" />
            </ChartClipPath>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr] gap-2 mb-2">
    <Field label="Show area" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <Preview data={dateSeriesData}>
    <div class="h-[300px] p-4 border rounded">
      <Chart
        data={dateSeriesData}
        x="date"
        xScale={scaleTime()}
        y="value"
        yDomain={[0, null]}
        yNice
        padding={{ left: 16, bottom: 24 }}
      >
        <Svg>
          <Axis placement="left" grid rule />
          <Axis
            placement="bottom"
            format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
            rule
          />
          {#if show}
            <Spline draw={{ easing: cubicInOut }} class="stroke-2 stroke-primary" />
            <ChartClipPath
              initialY={300}
              initialHeight={0}
              tweened={{
                y: { duration: 1000, easing: cubicInOut, delay: 500 },
                height: { duration: 1000, easing: cubicInOut, delay: 500 },
              }}
            >
              <Area class="fill-primary/30" />
            </ChartClipPath>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>Threshold with RectClipPath</h2>

<Preview data={negativeDateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={negativeDateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      let:width
      let:height
      let:yScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, { variant: 'short' })} />
        <Rule y={0} />
        <RectClipPath x={0} y={0} {width} height={yScale(0)}>
          <Area line={{ class: 'stroke-2 stroke-success' }} class="fill-success/20" />
        </RectClipPath>
        <RectClipPath x={0} y={yScale(0)} {width} height={height - yScale(0)}>
          <Area line={{ class: 'stroke-2 stroke-danger' }} class="fill-danger/20" />
        </RectClipPath>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Threshold with RectClipPath (over/under)</h2>

<Preview data={negativeDateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={negativeDateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      let:width
      let:height
      let:yScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, { variant: 'short' })} />
        <Rule y={0} />
        <RectClipPath x={0} y={0} {width} height={yScale(0)}>
          <Area line={{ class: 'stroke-2 stroke-success' }} class="fill-success/20" />
        </RectClipPath>
        <RectClipPath x={0} y={yScale(0)} {width} height={height - yScale(0)}>
          <Area y0={(d) => 0} line={{ class: 'stroke-2 stroke-danger' }} class="fill-danger/20" />
        </RectClipPath>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Highlight color based on value using color scale</h2>

<Preview data={negativeDateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={negativeDateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      c={(d) => (d.value < 0 ? 'under' : 'over')}
      cScale={scaleOrdinal()}
      cDomain={['over', 'under']}
      cRange={['hsl(var(--color-success))', 'hsl(var(--color-danger))']}
      let:width
      let:height
      let:yScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, { variant: 'short' })} />
        <Rule y={0} />
        <RectClipPath x={0} y={0} {width} height={yScale(0)}>
          <Area y0={(d) => 0} line={{ class: 'stroke-2 stroke-success' }} class="fill-success/20" />
        </RectClipPath>
        <RectClipPath x={0} y={yScale(0)} {width} height={height - yScale(0)}>
          <Area y0={(d) => 0} line={{ class: 'stroke-2 stroke-danger' }} class="fill-danger/20" />
        </RectClipPath>
        <Highlight lines points />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{formatDate(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Highlight color based on value using tooltip slot prop</h2>

<Preview data={negativeDateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={negativeDateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      let:width
      let:height
      let:yScale
      let:tooltip
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, { variant: 'short' })} />
        <Rule y={0} />
        <RectClipPath x={0} y={0} {width} height={yScale(0)}>
          <Area y0={(d) => 0} line={{ class: 'stroke-2 stroke-success' }} class="fill-success/20" />
        </RectClipPath>
        <RectClipPath x={0} y={yScale(0)} {width} height={height - yScale(0)}>
          <Area y0={(d) => 0} line={{ class: 'stroke-2 stroke-danger' }} class="fill-danger/20" />
        </RectClipPath>
        <Highlight
          lines={{
            class: tooltip.data?.value < 0 ? 'stroke-danger' : 'stroke-success',
          }}
          points={{
            class: tooltip.data?.value < 0 ? 'fill-danger' : 'fill-success',
          }}
        />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{formatDate(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Threshold with LinearGradient</h2>

<Preview data={negativeDateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={negativeDateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      let:yScale
      let:height
      let:padding
    >
      {@const thresholdValue = 0}
      {@const thresholdOffset = yScale(thresholdValue) / (height + padding.bottom)}
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, { variant: 'short' })} />
        <Rule y={0} />
        <LinearGradient
          stops={[
            [thresholdOffset, 'hsl(var(--color-success))'],
            [thresholdOffset, 'hsl(var(--color-danger))'],
          ]}
          units="userSpaceOnUse"
          vertical
          let:gradient
        >
          <Area line={{ stroke: gradient, class: 'stroke-2' }} fill={gradient} fillOpacity={0.2} />
        </LinearGradient>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Threshold with LinearGradient (over/under)</h2>

<Preview data={negativeDateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={negativeDateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      let:yScale
      let:height
      let:padding
    >
      {@const thresholdValue = 0}
      {@const thresholdOffset = yScale(thresholdValue) / (height + padding.bottom)}
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, { variant: 'short' })} />
        <Rule y={0} />
        <LinearGradient
          stops={[
            [thresholdOffset, 'hsl(var(--color-success))'],
            [thresholdOffset, 'hsl(var(--color-danger))'],
          ]}
          units="userSpaceOnUse"
          vertical
          let:gradient
        >
          <Area
            y0={(d) => 0}
            line={{ stroke: gradient, class: 'stroke-2' }}
            fill={gradient}
            fillOpacity={0.2}
          />
        </LinearGradient>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Clipped area on Tooltip</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] border rounded">
    <Chart
      data={data.appleStock}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ top: 48, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      let:width
      let:height
      let:padding
      let:tooltip
    >
      <Svg>
        <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient>
          <Area line={{ class: 'stroke-2 stroke-primary opacity-20' }} fill={gradient} />
          <RectClipPath x={0} y={0} width={tooltip.data ? tooltip.x : width} {height} spring>
            <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
          </RectClipPath>
        </LinearGradient>
        <Highlight points lines={{ class: 'stroke-primary [stroke-dasharray:unset]' }} />
        <Axis placement="bottom" />
      </Svg>

      <Tooltip.Root
        y={48}
        xOffset={4}
        variant="none"
        class="text-sm font-semibold text-primary leading-3"
        let:data
      >
        {format(data.value, 'currency')}
      </Tooltip.Root>

      <Tooltip.Root x={4} y={4} variant="none" class="text-sm font-semibold leading-3" let:data>
        {format(data.date, PeriodType.Day)}
      </Tooltip.Root>

      <Tooltip.Root
        x="data"
        y={height + padding.top + 2}
        anchor="top"
        variant="none"
        class="text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded whitespace-nowrap"
        let:data
      >
        {format(data.date, PeriodType.Day)}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
