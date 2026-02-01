---
title: Simplified Charts
order: 4
---

<script lang="ts">
  import Code from '$lib/components/Code.svelte';
  import Example from '$lib/components/Example.svelte';

  const legendsnippetsource = $derived(`
  <LineChart ...>
    {#snippet legend({ getLegendProps })}
      <Legend {...getLegendProps()} tickFormat={(s) => s.toUpperCase()} />
    {/snippet}
</LineChart>
`)
</script>

The LayerChart project was written to offer options for both flexibility/complexity as well as approachablilty/simplicity. This brings us to a decision as you start your first LayerChart.

## Use `<Chart>` or `Simple Chart`.

1. If you use `<Chart>`, you will layer in the exact subcomponents you wish to make your chart.
   - The props details are fully up to you and fully customizable but the tradeoff is that you will need to implement more of the chart yourself.
   - This is a good choice if you are experienced with Layerchart or plan on a need extensive control of many of the chart components.

2. You can use a Simple Chart if you are making a chart of supported types [ArcChart](https://next.layerchart.com/docs/components/ArcChart), [AreaChart](https://next.layerchart.com/docs/components/AreaChart), [BarChart](https://next.layerchart.com/docs/components/BarChart), [PieChart](https://next.layerchart.com/docs/components/PieChart) or [ScatterChart](https://next.layerchart.com/docs/components/ScatterChart) (more to come).
   - This is the recommended path for most users.
   - Under the hood, a simple chart is just a `<Chart>` with a set of default subcomponents and predefined props.
   - Out of the box, Simple charts provide common functionality you need with exposed props which should cover most of the simple customizations.
   - Lets use <[LineChart](https://next.layerchart.com/docs/components/LineChart)> as and example and look at how little code is need to make this complex chart including built in tooltips, rule, axes, highlights and a legend.

> Hover over a line, hover over legend items, and click legend items to see all the functionality given to you.

<Example name="legend" component="LineChart" showCode />

## Additional Simple Charts Customization

What happens when you inevidently wish to tweak something in your simplechart and that customization is not accessible via props? While you could rewrite from scratch using `<Chart>`, simplecharts fortunately gives you an escape hatch. Simple charts accepts children snippets giving you full control over the subcomponents just like a layered `<Chart>`.

Here is a bit of a contrived example where we will uppercase the legend labels. We will use use a legend snippet to achieve this.

<Code copyButton={false} source="<LineChart legend ... />" />

becomes

<Code copyButton={false} source={legendsnippetsource} />

Notice how we send getLegendProps to the snippet and then pass it to the `<Legend>` component. This is a common powerful pattern in `Simple charts` where you can use snippets to customize the rendering of components while still leveraging all of the the underlying simple chart's built in functionality.

> It is a best practice to place the `{...getLegendProps()}` as the first prop. This allows you to overwrite any of its props by listing them to subsequently.

The legend snippet by default visually applies the `<Legend>` subcomponent above the chart elements. However with certain other components you may wish them to appear in different "layers". If you were using the `<Chart>` approach, you would just change the order you implement subcomponents. However because these are snippets, the simple chart is rendering them in a certain logical order. This may not be exactly what you want, so simple chart gives you some additional snippets to allow you to wrap other snippets thus rendering in the layer you desire.

- `{#snippet marks()}` applies them with other chart elements
- `{#snippet abovemarks()}` applies them above chart elements
- `{#snippet belowmarks()}` applies them below chart elements
