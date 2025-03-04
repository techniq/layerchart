<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { geoAlbersUsa, geoAlbers, geoMercator, geoPath as d3geoPath } from 'd3-geo';
  import { feature } from 'topojson-client';

  import { Area, Axis, Canvas, Chart, ChartClipPath, GeoPath, LinearGradient, Svg, Tooltip, geoFitObjectTransform } from 'layerchart';
  import TransformControls from '$lib/components/TransformControls.svelte';
  import { SelectField } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import type { GeometryObjectA } from 'topojson-specification';
    import { mdiNumeric0BoxMultiple } from '@mdi/js';
    import type { DomainType } from 'layerchart/utils/scales.js';
    import { extent } from 'd3-array';
    import { scaleTime } from 'd3-scale';


  export let data;

  const xScale = scaleTime()

  let xDomain: DomainType | undefined = [null, null]
  let yDomain: DomainType = [0, null]

  $: xRange = buildXRange(data.appleStock)
  $: yDomain = extent(data.appleStock, (d) => d.value)

  function buildXRange(data: {date: Date; value: number}[]) {
    const xExtent = extent(data, (d) => d.date)
    if (xExtent[0] instanceof Date && xExtent[1] instanceof Date) {
    return [xScale(xExtent[0]), xScale(xExtent[1])]
    }
    return [null, null]
  }
  
  function translateXDomain(deltaX: number) {
    if (deltaX && xDomain?.[0] && xRange[0] !== null && xRange[1] !== null) {
      const curStartX = xScale(xDomain[0] as Date)
      const curEndX = xScale(xDomain[1] as Date)
      const origDelta = curEndX - curStartX

      let newStartX: number
      let newEndX: number

      if (deltaX > 0) {
        newEndX = Math.min(curEndX + deltaX, xRange[1])
        newStartX = newEndX - origDelta
      } else {
        newStartX = Math.max(curStartX + deltaX, xRange[0])
        newEndX = newStartX + origDelta
      }

      const newStartDate = xScale.invert(newStartX)
      const newEndDate = xScale.invert(newEndX)

      xDomain = [newStartDate, newEndDate]
    }
  }

</script>

<h1>Sync BrushContext</h1>

<Preview data={data}>

    <div class="h-[300px]">
      <Chart
        data={data.appleStock}
        x="date"
        {xScale}
        {xDomain}
        y="value"
        {yDomain}
        padding={{ left: 16, bottom: 24 }}
        transform={{
          mode: 'canvas',
          tweened: {duration: 800, easing: cubicOut},
          initialScrollMode: 'translate',
          // Override processTranslate to translate the domain, not the chart itself
          processTranslate: (x, y, deltaX) => {
            // Invert deltaX for more natural horizontal scrolling
            translateXDomain(-deltaX)
            return { x: 0, y: 0}
          }
        }}
      >
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          <ChartClipPath>
            <LinearGradient
              class="from-primary/50 to-primary/0"
              vertical
              let:gradient
            >
              <Area
                line={{ class: "stroke-2 stroke-primary" }}
                fill={gradient}
              />
            </LinearGradient>
          </ChartClipPath>
        </Svg>
      </Chart>
    </div>

    <div class="h-[40px]">
      <Chart
        data={data.appleStock}
        x="date"
        {xScale}
        y="value"
        padding={{ left: 16 }}
        brush={{
          // Sync the x domain with the chart in order to move the brush
          // when the chart is horizontally scrolled .
          xDomain, 
          onchange: (e) => (xDomain = e.xDomain),
          onreset: () => (xDomain = undefined)
        }}
      >
        <Svg>
          <Area
            line={{ class: "stroke-2 stroke-primary" }}
            class="fill-primary/20"
          />
        </Svg>
      </Chart>
    </div>
    </Preview>