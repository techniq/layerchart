# Changes

## Slots -> Snippets

[Snippets](https://svelte.dev/docs/svelte/snippet) are a new feature in Svelte 5 that replaces slots with a more powerful, composable, and flexible API. Although snippets require a couple extra lines of code, they are more powerful, typeable, and flexible.

So where before you would write something like this to insert some custom content into the "marks" slot:

```svelte
<BarChart>
  <svelte:fragment slot="marks" let:series let:getBarProps>
    <!-- ... -->
  </svelte:fragment>
</BarChart>
```

Today you write this:

```svelte
<BarChart>
  {#snippet marks({ series, getBarProps })}
    <!-- ... -->
  {/snippet}
</BarChart>
```

### children Snippet

There are many components whose entire purpose is to provide context to other pieces of your greater chart component. The most prominent of which is the `<Chart>` component. These exposed slot props have been replaced with snippet props to the `children` snippet of the component.

For example, previously in LayerChart, the `<Chart>` component exposed a _ton_ of individual slot props that you would access like so:

```svelte
<Chart let:width let:height let:x let:cGet let:padding let:y let:cScale let:yScale>
  <!-- ... -->
</Chart>
```

Now, you can access all of these props via the `context` children snippet prop:

```svelte
<Chart>
  {#snippet children({ context })}
    <!-- context.width, context.height, context.x, context.cGet, ... -->
  {/snippet}
</Chart>
```

The other "contexts" that are setup by the `<Chart>` are also included as separate props:

```svelte
<Chart>
  {#snippet children({ context, geoContext, brushContext, transformContext, tooltipContext })}
    <!-- context.width, context.height, context.x, context.cGet, ... -->
    <!-- geoContext.projection -->
    <!-- tooltipContext.show() tooltipContext.data -->
    <!-- brushContext.range -->
    <!-- transformContext.mode -->
  {/snippet}
</Chart>
```

Each of these contexts provide their properties in the form of "getters", so to retain reactivity you should not destructure them from each context.

For example, if you want to access the `width` of the chart, you should do it like this:

```svelte
{#snippet children({ context })}
  <div>{context.width}</div>
{/snippet}
```

Each of the components that previously exposed slot props now expose their props via the `children` snippet prop.

```svelte
<LinearGradient>
  {#snippet children({ gradient })}
    <rect fill={gradient} />
  {/snippet}
</LinearGradient>
```

## Event Handlers/Callbacks

All non-native browser event handlers have been renamed to camelCase to prevent confusion and conflicts with underlying browser events. For example, `onarcclick` is now `onArcClick`.

## Context Methods

You can retrieve any specific context within the `<Chart>` tree by using its respective function:

```ts
import {
  getChartContext,
  getTransformContext,
  getTooltipContext,
  getBrushContext,
  getGeoContext,
} from 'layerchart';

// these are objects of getters, so destructuring them would lose reactivity
const chartCtx = getChartContext(); // chartCtx.width
const transformCtx = getTransformContext(); // transformCtx.mode
const tooltipCtx = getTooltipContext(); // tooltipCtx.data
const brushCtx = getBrushContext(); // brushCtx.range
const geoCtx = getGeoContext(); // geoCtx.projection
```

## Tooltip Payloads for Simplified Charts

### The Problem

While the existing tooltip data exposed via `data` from the `<Tooltip.Root>` children snippet is great because
it gives you the minimal information you need (just the data for the hovered item), it can be a bit cumbersome when you want
to display series data in the tooltip.

This is handled out of the box with the various simplified charts, such as `<BarChart>`, `<AreaChart>`, etc. However, if you opt-out
of the tooltips provided by the simplified charts, you're now stuck reinventing the wheel.

### The Solution

Both the simplified chart implementation as well as users' custom tooltip implementations can reap the same benefits from the simplified chart.

A new `TooltipPayload` type has been added to the project that provides a more complete payload for tooltips when using the simplified charts.

This is subject to adjustment as feedback is received, but the current payload looks like this:

```ts
export type TooltipPayload = {
  color?: string;
  name?: string;
  key: string;
  label?: string;
  value?: any;
  keyAccessor?: Accessor<any>;
  valueAccessor?: Accessor<any>;
  labelAccessor?: Accessor<any>;
  chartType?: SimplifiedChartType;
  // the original data point that was hovered over
  // exactly the same as the data prop passed to the tooltip
  payload: any;
  rawSeriesData?: SeriesData<any, any>;
  formatter?: FormatType;
};
```

This payload is passed to the `<Tooltip.Root>` `children` snippet via the `payload` prop alongside the existing `data` prop.

This is accomplished by a context provided by the various simplified charts and then the `<Tooltip.Context>` handles building the payload based on that context.

When not used with a simplified chart, the `payload` prop will be an array with a single object that contains the `data` via the object's `payload` property:

```ts
console.log(payload); // [{ payload: { ...data }}]
```

When used with one of the simplified charts, it will have more information populated.

## Classnames for all

All underlying elements rendered by LayerChart _should_ now have an identifiable classname, prefixed with `lc-` to prevent conflicts with other libraries and your own styles (e.g. `lc-bar`, `lc-arc`, `lc-tooltip-context`, etc.) Perhaps we should document these somehow in the API reference, we'd need a source of truth and checks to ensure they do in fact exist though.

This should make it easier to style the various elements included within the chart components.

## Chart Context via Simplified Charts

You can now get a reference to the `<Chart>` context via the simplified charts by using `bind:context` on the simplified chart.
This is useful for getting the height, width, and other properties of the chart for motion, etc.

```svelte
<script lang="ts">
  import { BarChart, AreaChart } from 'layerchart';

  let barContext = $state<ChartContext<any>>();
  let areaContext = $state<ChartContext<any>>();
</script>

<BarChart bind:context={barContext}>
  <!-- ... -->
</BarChart>
<AreaChart bind:context={areaContext}>
  <!-- ... -->
</AreaChart>
```
