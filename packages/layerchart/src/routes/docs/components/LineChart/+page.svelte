<script lang="ts">
  import { Axis, Highlight, LineChart, pivotLonger, Spline, Svg, Tooltip } from 'layerchart';
  import { PeriodType } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const dateSeriesData = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

  const keys = ['apples', 'bananas', 'oranges'];
  const multiSeriesData = createDateSeries({
    count: 30,
    min: 10,
    max: 100,
    value: 'integer',
    keys,
  });
  const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value" />
  </div>
</Preview>

<h2>Series</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart
      data={multiSeriesData}
      x="date"
      series={[
        { label: 'apples', value: 'apples', color: 'hsl(var(--color-danger))' },
        { label: 'bananas', value: 'bananas', color: 'hsl(var(--color-success))' },
        { label: 'oranges', value: 'oranges', color: 'hsl(var(--color-warning))' },
      ]}
    />
  </div>
</Preview>

<h2>Series (highlight on hover)</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart
      data={multiSeriesFlatData}
      x="date"
      y="value"
      tooltip={{ mode: 'voronoi' }}
      let:x
      let:tooltip
    >
      {@const series = [
        { label: 'apples', value: 'apples', color: 'hsl(var(--color-danger))' },
        { label: 'bananas', value: 'bananas', color: 'hsl(var(--color-success))' },
        { label: 'oranges', value: 'oranges', color: 'hsl(var(--color-warning))' },
      ]}
      {@const activeSeriesColor = series.find((s) => s.value === tooltip.data?.fruit)?.color}
      <Svg>
        <Axis
          placement="left"
          grid
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />
        <Axis
          placement="bottom"
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />

        {#each series as s}
          {@const color =
            tooltip.data == null || tooltip.data.fruit === s.value
              ? s.color
              : 'hsl(var(--color-surface-content) / 20%)'}
          <Spline data={multiSeriesData} y={s.value} class="stroke-2" stroke={color} />
        {/each}

        <Highlight lines points={{ fill: activeSeriesColor }} />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label={data.fruit} value={data.value} color={activeSeriesColor} />
        </Tooltip.List>
      </Tooltip.Root>
    </LineChart>
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value" labels={{ offset: 10 }} />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value">
      <svelte:fragment slot="tooltip" let:x let:y>
        <Tooltip.Root let:data>
          <Tooltip.Header>{format(x(data), PeriodType.DayTime)}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="value" value={y(data)} />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </LineChart>
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value" let:x let:y>
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Spline class="stroke-2 stroke-primary" />
        <Highlight points lines />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data), PeriodType.DayTime)}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={y(data)} />
        </Tooltip.List>
      </Tooltip.Root>
    </LineChart>
  </div>
</Preview>

<!-- 

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
        <LinearGradient class="from-primary/50 to-primary/0" vertical let:url>
          <Area line={{ class: 'stroke-2 stroke-primary' }} fill={url} />
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
      r="fruit"
      rScale={scaleOrdinal()}
      rDomain={Object.keys(fruitColors)}
      rRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24, right: 48 }}
      tooltip={{ mode: 'voronoi' }}
      let:rScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        {#each dataByFruit as [fruit, data]}
          {@const color = rScale(fruit)}
          <Area
            {data}
            fill={color}
            fill-opacity={0.3}
            line={{ class: 'stroke-2', stroke: color }}
          />
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
      <Tooltip header={(data) => formatDate(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label={data.fruit} value={data.value} />
      </Tooltip>
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
          fill-opacity={0.3}
          line={{ stroke: fruitColors.apples, class: 'stroke-2' }}
        />

        <Area
          y1={(d) => d.bananas}
          class="stroke-2"
          fill={fruitColors.bananas}
          fill-opacity={0.3}
          line={{ stroke: fruitColors.bananas, class: 'stroke-2' }}
        />

        <Area
          y1={(d) => d.oranges}
          class="stroke-2"
          fill={fruitColors.oranges}
          fill-opacity={0.3}
          line={{ stroke: fruitColors.oranges, class: 'stroke-2' }}
        />

        <Highlight y={(d) => d.apples} points={{ fill: fruitColors.apples }} />
        <Highlight y={(d) => d.bananas} points={{ fill: fruitColors.bananas }} />
        <Highlight y={(d) => d.oranges} points={{ fill: fruitColors.oranges }} />
        <Highlight lines />
      </Svg>
      <Tooltip header={(data) => formatDate(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="apples" value={data.apples} />
        <TooltipItem label="bananas" value={data.bananas} />
        <TooltipItem label="oranges" value={data.oranges} />
      </Tooltip>
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
      r="fruit"
      rScale={scaleOrdinal()}
      rDomain={Object.keys(fruitColors)}
      rRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24, right: 48 }}
      tooltip={{ mode: 'voronoi' }}
      let:tooltip
      let:rScale
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
              ? rScale(fruit)
              : 'hsl(var(--color-surface-content) / 20%)'}
          <Area
            {data}
            fill={color}
            fill-opacity={0.3}
            line={{ class: 'stroke-2', stroke: color }}
          />
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
      <Tooltip header={(data) => formatDate(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label={data.fruit} value={data.value} />
      </Tooltip>
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
      r="fruit"
      rScale={scaleOrdinal()}
      rDomain={Object.keys(fruitColors)}
      rRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'voronoi' }}
      let:rScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        {#each dataByFruit as [fruit, data]}
          {@const color = rScale(fruit)}
          <Area
            {data}
            fill={color}
            fill-opacity={0.3}
            line={{ class: 'stroke-2', stroke: color }}
          />
        {/each}
        <Labels format="integer" />
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => formatDate(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label={data.fruit} value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Clip tween on mount</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr] gap-2 mb-2">
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
  <div class="grid grid-cols-[auto,1fr] gap-2 mb-2">
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
  <div class="grid grid-cols-[auto,1fr] gap-2 mb-2">
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
        <LinearGradient class="from-primary/50 to-primary/0" vertical let:url>
          <Area line={{ class: 'stroke-2 stroke-primary opacity-20' }} fill={url} />
          <RectClipPath x={0} y={0} width={tooltip.data ? tooltip.x : width} {height} spring>
            <Area line={{ class: 'stroke-2 stroke-primary' }} fill={url} />
          </RectClipPath>
        </LinearGradient>
        <Highlight points lines={{ class: 'stroke-primary [stroke-dasharray:unset]' }} />
        <Axis placement="bottom" />
      </Svg>

      <Tooltip
        y={48}
        xOffset={4}
        variant="none"
        class="text-sm font-semibold text-primary leading-3"
        let:data
      >
        {format(data.value, 'currency')}
      </Tooltip>

      <Tooltip x={4} y={4} variant="none" class="text-sm font-semibold leading-3" let:data>
        {format(data.date, PeriodType.Day)}
      </Tooltip>

      <Tooltip
        x="data"
        y={height + padding.top + 2}
        anchor="top"
        variant="none"
        class="text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded whitespace-nowrap"
        let:data
      >
        {format(data.date, PeriodType.Day)}
      </Tooltip>
    </Chart>
  </div>
</Preview> -->
