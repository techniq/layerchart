# Scales

> WIP

## What is a scale

At its essenece, a scale is a function that maps data values (`domain`) to pixel values (`range`) on a per-dimension basis (x, y, color, etc).

LayerChart uses [d3-scale](https://d3js.org/d3-scale) under the hood which provides many different scales (i.e. "mappers") including `scaleLinear`, `scaleTime`, `scaleBand`, and others.

![d3 scale image](https://jckr.github.io/blog/wp-content/uploads/2011/08/d3scale1.png)

this example basically says data/domain values are between `20` and `80` and range/pixels values are between `0` and `120`, and you would setup this (under the hood, what LayerChart does for you).

```js
const xScale = scaleLinear().domain([20, 80]).range([0, 120]);
```

or shorthand

```js
const xScale = scaleLinear([20, 80], [0, 120]);
```

and would produce the following:

- `xScale(20)` => `0`
- `xScale(80)` => `120`
- `xScale(50)` => `60`

In LayerChart, range and domain are determined / defaulted for you

- `xDomain` => all `x` values in data (based on value accessor),
- `xRange` => `width` of chart (minus left/right padding),
- `yDomain` => all `y` values in data (based on value accessor),
- `yRange` => `height` of chart (minus top/bottom padding)

for most scales, like scaleLinear, you specify the extents (min/max), which is why it is a 2 item array

LayerChart will calcualte these for you, or you can pass an explicit value for one of both. If the other value is `null`, it will be calculated based on the data/chart dimensions

```js
<Chart yDomain={[0, null]} />
```

This means also have a min extent of `0` regardless of your smallest data value, but calculate the max (by specifying `null`)

this guarantees you always show `0` on your a-axis

## Ticks

https://observablehq.com/@d3/scale-ticks?collection=@d3/d3-scale

## Resources

- [Introducing d3-scale](https://medium.com/@mbostock/introducing-d3-scale-61980c51545f 'https://medium.com/@mbostock/introducing-d3-scale-61980c51545f')
- [D3 in Depth: D3 Scale functions](https://www.d3indepth.com/scales/)
- [https://scottmurray.org/tutorials/d3/scales](https://scottmurray.org/tutorials/d3/scales 'https://scottmurray.org/tutorials/d3/scales')
- [https://jckr.github.io/blog/2011/08/11/d3-scales-and-color/](https://jckr.github.io/blog/2011/08/11/d3-scales-and-color/ 'https://jckr.github.io/blog/2011/08/11/d3-scales-and-color/')
- [d3-scale documentation](https://d3js.org/d3-scale)
- https://observablehq.com/@d3/continuous-scales?collection=@d3/d3-scale
