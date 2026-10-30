---
title: Accessibility
order: 9
---

## Keyboard

`LineChart`, `AreaChart`, `BarChart`, and `ScatterChart` are keyboard accessible by default. The plot area is a single tab stop, and once it is focused the arrow keys move the tooltip from point to point. The tooltip and highlight shown are the ones the pointer shows, and each point is announced to screen readers. Name the chart with `aria-label`:

```svelte
<LineChart {data} x="date" series={[...]} aria-label="Fruit sold per day" />
```

`Chart` isn't always cartesian (a map, a treemap), so there it is opt-in with `keyboard`. Turn it off on the simplified charts with `keyboard={false}`.

:example{ component="LineChart" name="keyboard" }

| Key                     | Action                                       |
| ----------------------- | -------------------------------------------- |
| `Tab`                   | Focus the chart, showing its first point     |
| `→` / `←`               | Next / previous point                        |
| `↓` / `↑`               | Next / previous series                       |
| `Page Down` / `Page Up` | Next / previous series                       |
| `Home` / `End`          | First / last point                           |
| `Enter` / `Space`       | Activate the point, calling `onTooltipClick` |
| `Escape`                | Hide the tooltip                             |

Points are visited in the order they appear on screen, whatever the order of the data. Navigation stops at either end rather than wrapping, and skips points where a series has no value.

### Series

With more than one series, the left and right arrows start out stepping through each position, reading every series there, just like scrubbing with the pointer. The up and down arrows move into a series, which highlights it and fades the others, just like hovering its legend item. From then on the left and right arrows stay in that series. Moving to another series keeps the same position when that series has a value there, and otherwise goes to its nearest point.

Long data grouped by `c` treats each category as a series.

### Horizontal charts

On a horizontal chart (`orientation="horizontal"`, or `valueAxis="x"`), the up and down arrows move between points and the left and right arrows move between series. The arrows always move along the axis the points are laid out on.

:example{ component="BarChart" name="keyboard-horizontal" }

### Activating a point

`Enter` and `Space` call `onTooltipClick` (or the `onclick` passed to `tooltipContext`) with the focused point. The handler receives a `MouseEvent`, just as activating a native button from the keyboard fires a `click`.

### Screen readers

The plot area has `role="application"`, so screen readers pass the arrow keys to the chart rather than using them to read the page. Name the chart with `aria-label`. Instructions for the keys are linked with `aria-describedby`, and each point is announced through a live region as the keyboard reaches it, for example `apples, 1/5/2024, 42. 5 of 30`.

### Styling

Focusing the plot area with the keyboard shows its first point, and that point's highlight and tooltip mark where focus is, so the plot area isn't outlined. It is outlined while it has focus with no point shown, such as after `Escape` or on a chart with no data, so focus is never invisible. To always outline it, style `.lc-tooltip-context:focus-visible`:

```css
.lc-tooltip-context:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}
```

### Pointer and keyboard together

The keyboard and the pointer drive the same tooltip. Moving the pointer over the chart takes over from the keyboard, and the next key press carries on from whatever the pointer was showing. Moving focus away from the chart hides a tooltip the keyboard opened.

`keyboard` works with every tooltip `mode`, including `manual`, and with [chart groups](/docs/guides/chart-group), so navigating one chart drives the others. It can also be set as `tooltipContext={{ keyboard: true }}`.

### Supported charts

Keyboard navigation places the tooltip from the chart's `x` and `y` scales, so it covers cartesian charts: line, area, bar, and scatter charts, horizontal ones, and facets. Radial charts and `PieChart` / `ArcChart` aren't supported yet, since their points are placed by arc geometry, so they add no tab stop.
