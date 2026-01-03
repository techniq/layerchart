
<!--
	@component
	## Chart

	## Description

	Base component providing chart dimensions and contexts such as TooltipContext, GeoContext, and TransformContext. See also simplified charts such as AreaChart and BarChart for streamlined implementations.

	## Category

	[[Charts](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Charts.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [Chart](/docs/components/Chart)

	## API Properties

	* ssr:<boolean>=false - Whether this chart should be rendered server side 
	* pointerEvents:<boolean>=true - Whether to allow pointer events via CSS.
Set this to `false` to set `pointer-events: none;` on all components, disabling
all mouse interactions. 
	* position:<string>='relative' - Determine the positioning of the wrapper div.
Set this to `'absolute'` when you want to stack layers. 
	* percentRange:<boolean>=false - If `true`, set all scale ranges to `[0, 100]`.
Ranges reversed via `xReverse`, `yReverse`, or `rReverse` props will
continue to be reversed as usual. 
	* ref:<HTMLElement> - A bindable reference to the root container element. 
	* data:<T[] | readonly T[] | HierarchyNode<T> | SankeyGraph<any, any>> - If `data` is not a flat array of objects and you want to use any of the scales, set a flat
version of the data via the `flatData` prop. 
	* flatData:<T[] | readonly T[] | HierarchyNode<T> | SankeyGraph<any, any>> - A flat version of data. 
	* x:<Accessor<T>> - The x accessor. The key in each row of data that corresponds to the x-field. This can be a
string, an accessor function, a number or an array of any combination of those types. This
property gets converted to a function when you access it through the context. 
	* y:<Accessor<T>> - The y accessor. The key in each row of data that corresponds to the y-field. This can be a
string, an accessor function, a number or an array of any combination of those types. This
property gets converted to a function when you access it through the context. 
	* z:<Accessor<T>> - The z accessor. The key in each row of data that corresponds to the z-field. This can be a
string, an accessor function, a number or an array of any combination of those types. This
property gets converted to a function when you access it through the context. 
	* r:<Accessor<T>> - The r accessor. The key in each row of data that corresponds to the r-field. This can be a
string, an accessor function, a number or an array of any combination of those types. This
property gets converted to a function when you access it through the context. 
	* x1:<Accessor<T>> - The x1 accessor. The key in each row of data that corresponds to the x1-field. This can be a
string, an accessor function, a number or an array of any combination of those types. This
property gets converted to a function when you access it through the context. 
	* y1:<Accessor<T>> - The y1 accessor. The key in each row of data that corresponds to the y1-field. This can be
a string, an accessor function, a number or an array of any combination of those types. This
property gets converted to a function when you access it through the context. 
	* c:<Accessor<T>> - The c (color) accessor. The key in each row of data that corresponds to the color. This can
be a string or an accessor function. This property gets converted to a function when you
access it through the context. 
	* xDomain:<DomainType> - Set a min or max. For linear scales, if you want to inherit the value from the data's
extent, set that value to `null`. This value can also be an array because sometimes your
scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
useful for color series. Set it to a function that receives the computed domain and lets you
return a modified domain, useful for sorting values. 
	* yDomain:<DomainType> - Set a min or max. For linear scales, if you want to inherit the value from the data's
extent, set that value to `null`. This value can also be an array because sometimes your
scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
useful for color series. Set it to a function that receives the computed domain and lets you
return a modified domain, useful for sorting values. 
	* zDomain:<DomainType> - Set a min or max. For linear scales, if you want to inherit the value from the data's
extent, set that value to `null`. This value can also be an array because sometimes your
scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
useful for color series. Set it to a function that receives the computed domain and lets you
return a modified domain, useful for sorting values. 
	* rDomain:<DomainType> - Set a min or max. For linear scales, if you want to inherit the value from the data's
extent, set that value to `null`. This value can also be an array because sometimes your
scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
useful for color series. Set it to a function that receives the computed domain and lets you
return a modified domain, useful for sorting values. 
	* x1Domain:<DomainType> - Set a min or max. For linear scales, if you want to inherit the value from the data's
extent, set that value to `null`. This value can also be an array because sometimes your
scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
useful for color series. Set it to a function that receives the computed domain and lets you
return a modified domain, useful for sorting values. 
	* y1Domain:<DomainType> - Set a min or max. For linear scales, if you want to inherit the value from the data's
extent, set that value to `null`. This value can also be an array because sometimes your
scales are [piecewise](https://github.com/d3/d3-scale#continuous_domain) or are a list of
discrete values such as in [ordinal scales](https://github.com/d3/d3-scale#ordinal-scales),
useful for color series. Set it to a function that receives the computed domain and lets you
return a modified domain, useful for sorting values. 
	* cDomain:<DomainType> - Set the list of color values. 
	* xNice:<Nice>=false - Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the x domain. 
	* yNice:<Nice>=false - Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the y domain. 
	* zNice:<Nice>=false - Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the z domain. 
	* rNice:<Nice>=false - Applies D3's [scale.nice()](https://github.com/d3/d3-scale#continuous_nice) to the r domain. 
	* xPadding:<PaddingArray> - Assign a pixel value to add to the min or max of the scale. This will increase the scales
domain by the scale unit equivalent of the provided pixels. 
	* yPadding:<PaddingArray> - Assign a pixel value to add to the min or max of the scale. This will increase the scales
domain by the scale unit equivalent of the provided pixels. 
	* zPadding:<PaddingArray> - Assign a pixel value to add to the min or max of the scale. This will increase the scales
domain by the scale unit equivalent of the provided pixels. 
	* rPadding:<PaddingArray> - Assign a pixel value to add to the min or max of the scale. This will increase the scales
domain by the scale unit equivalent of the provided pixels. 
	* xScale:<XScale>=autoScale - The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
you want to override the default or you want to extra options. 
	* yScale:<YScale>=autoScale - The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
you want to override the default or you want to extra options. 
	* zScale:<AnyScale>=autoScale - The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
you want to override the default or you want to extra options. 
	* rScale:<AnyScale>=scaleSqrt - The D3 scale that should be used for the x-dimension. Pass in an instantiated D3 scale if
you want to override the default or you want to extra options. 
	* x1Scale:<AnyScale>=autoScale - The D3 scale that should be used for the x1-dimension. Pass in an instantiated D3 scale if
you want to override the default or you want to extra options. 
	* y1Scale:<AnyScale>=autoScale - The D3 scale that should be used for the y1-dimension. Pass in an instantiated D3 scale if
you want to override the default or you want to extra options. 
	* cScale:<AnyScale>=scaleOrdinal - The D3 scale that should be used for the  color dimension. Pass in an instantiated D3 scale
if you want to override the default or you want to extra options. 
	* xRange:<BaseRange> - Override the default x range of `[0, width]` by setting an array or function with argument
`({ width, height})` that returns an array. Setting this prop overrides `xReverse`. This can
also be a list of numbers or strings for scales with discrete ranges like
[scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
[scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). 
	* yRange:<BaseRange> - Override the default y range of `[0, height]` by setting an array or function with argument
`({ width, height})` that returns an array. Setting this prop overrides `yReverse`. This can
also be a list of numbers or strings for scales with discrete ranges like
[scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
[scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). 
	* zRange:<BaseRange> - Override the default z range of `[0, width]` by setting an array or function with argument
`({ width, height})` that returns an array. Setting this prop overrides `zReverse`. This can
also be a list of numbers or strings for scales with discrete ranges like
[scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
[scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). 
	* rRange:<BaseRange> - Override the default r range of `[1, 25]` by setting an array or function with argument
`({ width, height})` that returns an array. Setting this prop overrides `rReverse`. This can
also be a list of numbers or strings for scales with discrete ranges like
[scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
[scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). 
	* x1Range:<XRangeWithScale<XScale>> - Set the x1 range by setting an array or function with argument `({ xScale, width, height})`
that returns an array. This can also be a list of numbers or strings for scales with
discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
[scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). 
	* y1Range:<YRangeWithScale<YScale>> - Set the y1 range by setting an array or function with argument `({ yScale, width, height})`
that returns an array. This can also be a list of numbers or strings for scales with
discrete ranges like [scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
[scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). 
	* cRange:<string[] | readonly string[]> - Override the default y1 range of `[0, width]` by setting an array or function with argument
`({ yScale, width, height})` that returns an array. Setting this prop overrides `x1Reverse`.
This can also be a list of numbers or strings for scales with discrete ranges like
[scaleThreshold](https://github.com/d3/d3-scale#threshold-scales) or
[scaleQuantize](https://github.com/d3/d3-scale#quantize-scales). 
	* xReverse:<boolean>=false - Reverse the default x range. By default this is `false` and the range is `[0, width]`.
Ignored if you set the xRange prop. 
	* yReverse:<boolean>=true - Reverse the default y range. By default this is `true` and the range is `[height, 0]` unless
using an ordinal scale with a `.bandwidth` method for `yScale`.
Ignored if you set the `yRange` prop. 
	* zReverse:<boolean>=false - Reverse the default z range. By default this is `false` and the range is `[0, width]`.
Ignored if you set the zRange prop. 
	* rReverse:<boolean>=false - Reverse the default r range. By default this is `false` and the range is `[1, 25]`.
Ignored if you set the rRange prop. 
	* xDomainSort:<boolean>=false - ***Only used when scale is ordinal.***
Set whether the calculated unique items come back sorted. 
	* yDomainSort:<boolean>=false - ***Only used when scale is ordinal.***
Set whether the calculated unique items come back sorted. 
	* zDomainSort:<boolean>=false - ***Only used when scale is ordinal.***
Set whether the calculated unique items come back sorted. 
	* rDomainSort:<boolean>=false - ***Only used when scale is ordinal.***
Set whether the calculated unique items come back sorted. 
	* padding:<{ top?: number; right?: number; bottom?: number; left?: number; } | number> - The amount of padding to put around your chart. It operates like CSS
box-sizing: border-box; where values are subtracted from the parent container's width
and height, the same as a [D3 margin convention](https://bl.ocks.org/mbostock/3019563).

If a number is passed, it will be applied to all sides. 
	* extents:<{ x?: [ min: number, max: number ]; y?: [ min: number, max: number ]; r?: [ min: number, max: number ]; z?: [ min: number, max: number ]; }> - Manually set the extents of the x, y or r scale as a two-dimensional array of the min and
max you want. Setting values here will skip any dynamic extent calculation of the data for
that dimension. 
	* meta:<Record<string, any>> - Any extra configuration values you want available on the Chart context.
This could be useful for color lookups or additional constants. 
	* debug:<boolean>=false - Enable debug printing to the console.
Useful to inspect your scales and dimensions. 
	* verbose:<boolean>=true - Show warnings in the console. 
	* xBaseline:<number | null>=null - x value guaranteed to be visible in xDomain.  Useful with optional negative values since
`xDomain={[0, null]}` would ignore negative values 
	* yBaseline:<number | null>=null - y value guaranteed to be visible in yDomain.  Useful with optional negative values since
`yDomain={[0, null]}` would ignore negative values 
	* xInterval:<TimeInterval | null> - Time interval to use for the x-axis when using a time scale. 
	* yInterval:<TimeInterval | null> - Time interval to use for the y-axis when using a time scale. 
	* radial:<boolean>=false - Use radial instead of cartesian coordinates, mapping `x` to `angle` and `y`` to radial.
Radial lines are positioned relative to the origin, use transform (ex. `<Group center>`)
to change the origin 
	* children:<Snippet<[ { context: ChartContextValue<T, XScale, YScale>; } ]>> - undefined 
	* context:<ChartContextValue<T, XScale, YScale>> - A bindable reference to the chart context. 
	* geo:<Partial<ComponentProps<typeof GeoContext>>> - Props passed to GeoContext 
	* tooltip:<Partial<ComponentProps<typeof TooltipContext>> | boolean> - Props passed to the `TooltipContext` component. 
	* transform:<Partial<ComponentProps<typeof TransformContext>>> - Props passed to TransformContext 
	* brush:<Partial<ComponentProps<typeof BrushContext>> | boolean> - Props passed to BrushContext 
	* onResize:<(e: ChartResizeDetail) => void> - A callback function that is called when the chart is resized. 
	* ondragstart:<ComponentProps<typeof TransformContext>['ondragstart']> - undefined 
	* ondragend:<ComponentProps<typeof TransformContext>['ondragend']> - undefined 
	* onTransform:<ComponentProps<typeof TransformContext>['onTransform']> - undefined 
	* width:<number> - Sets width of the chart container.  Uses parent width if not set (bind:clientWidth) 
	* height:<number> - Sets height of the chart container.  Uses parent height if not set (bind:clientHeight) 

	## Related

	[ArcChart](/docs/components/ArcChart)
	[AreaChart](/docs/components/AreaChart)
	[BarChart](/docs/components/BarChart)
	[LineChart](/docs/components/LineChart)
	[PieChart](/docs/components/PieChart)
	[ScatterChart](/docs/components/ScatterChart)
	[TooltipContext](/docs/components/TooltipContext)
	[GeoContext](/docs/components/GeoContext)

	
-->
