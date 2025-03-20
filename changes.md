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
