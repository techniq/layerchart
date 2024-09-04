<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';
  import type { Readable } from 'svelte/store';
  import { extent } from 'd3-array';
  import { pointRadial } from 'd3-shape';
  import { notNull } from '@layerstack/utils/typeGuards';

  import { chartContext } from './ChartContext.svelte';
  import Circle from './Circle.svelte';
  import Link from './Link.svelte';
  import { isScaleBand, type AnyScale } from '../utils/scales.js';

  const context = chartContext() as any;
  const {
    data: contextData,
    x,
    xScale,
    xGet,
    y,
    yScale,
    yGet,
    rGet,
    padding,
    containerWidth,
    containerHeight,
    config,
    radial,
  } = context;

  type Offset = number | ((value: number, context: any) => number) | undefined;

  /** Override data instead of using context */
  export let data: any = undefined;

  export let r = 5;
  export let offsetX: Offset = undefined;
  export let offsetY: Offset = undefined;

  /** Enable showing links between related points (array x/y accessors) */
  export let links: boolean | Partial<ComponentProps<Link>> = false;

  export let fill: string | undefined = undefined;
  export let stroke: string | undefined = undefined;
  export let strokeWidth: number | string | undefined = undefined;

  type Point = { x: number; y: number; xValue: any; yValue: any; data: any };

  /** Render to canvas */
  export let render: ((ctx: CanvasRenderingContext2D, points: Point[]) => any) | undefined =
    undefined;

  let className: string | undefined = undefined;
  export { className as class };

  const canvas = getContext<{ ctx: Readable<CanvasRenderingContext2D> }>('canvas');
  const DEFAULT_FILL = 'rgb(0, 0, 0)';

  function getOffset(value: any, offset: Offset, scale: AnyScale) {
    if (typeof offset === 'function') {
      return offset(value, context);
    } else if (offset != null) {
      return offset;
    } else if (isScaleBand(scale) && !$radial) {
      return scale.bandwidth() / 2;
    } else {
      return 0;
    }
  }

  $: pointsData = data ?? $contextData;

  $: points = pointsData.flatMap((d: any) => {
    const xValue = $x(d);
    const yValue = $y(d);

    if (Array.isArray(xValue)) {
      /*
				x={["prop1" ,"prop2"]}
				y="prop3"
			*/
      return xValue.filter(notNull).map((xValue: number) => {
        return {
          x: $xScale(xValue) + getOffset($xScale(xValue), offsetX, $xScale),
          y: $yScale(yValue) + getOffset($yScale(yValue), offsetY, $yScale),
          xValue,
          yValue: $y(d),
          data: d,
        };
      });
    } else if (Array.isArray(yValue)) {
      /*
				x="prop1"
				y={["prop2" ,"prop3"]}
			*/
      return yValue.filter(notNull).map((yValue: number) => {
        return {
          x: $xScale(xValue) + getOffset($xScale(xValue), offsetX, $xScale),
          y: $yScale(yValue) + getOffset($yScale(yValue), offsetY, $yScale),
          xValue,
          yValue: $y(d),
          data: d,
        };
      });
    } else {
      /*
				x="prop1"
				y="prop2"
			*/
      return {
        x: $xScale(xValue) + getOffset($xScale(xValue), offsetX, $xScale),
        y: $yScale(yValue) + getOffset($yScale(yValue), offsetY, $yScale),
        xValue,
        yValue,
        data: d,
      };
    }
  }) as Point[];

  $: _links = pointsData.flatMap((d: any) => {
    const xValue = $x(d);
    const yValue = $y(d);

    if (Array.isArray(xValue)) {
      /*
				x={["prop1" ,"prop2"]}
				y="prop3"
			*/
      const [xMin, xMax] = extent($xGet(d)) as unknown as [number, number];
      const y = $yGet(d) + getOffset($yGet(d), offsetY, $yScale);
      return {
        source: {
          x: xMin + getOffset(xMin, offsetX, $xScale) + r,
          y,
        },
        target: {
          x: xMax + getOffset(xMax, offsetX, $xScale) - r,
          y: y,
        },
      };
    } else if (Array.isArray(yValue)) {
      /*
				x="prop1"
				y={["prop2" ,"prop3"]}
			*/
      const x = $xGet(d) + getOffset($xGet(d), offsetX, $xScale);
      const [yMin, yMax] = extent($yGet(d)) as unknown as [number, number];
      return {
        source: {
          x: x,
          y: yMin + getOffset(yMin, offsetY, $yScale),
        },
        target: {
          x: x,
          y: yMax + getOffset(yMax, offsetY, $yScale),
        },
      };
    }
  });

  $: renderContext = canvas ? 'canvas' : 'svg';
  $: ctx = canvas?.ctx;
  $: if (renderContext === 'canvas' && $ctx) {
    let computedStyles: Partial<CSSStyleDeclaration> = {};

    // Transfer classes defined on <GeoPath> to <canvas> to enable window.getComputedStyle() retrieval (Tailwind classes, etc)
    if (className) {
      $ctx.canvas.classList.add(...className.split(' '));
      computedStyles = window.getComputedStyle($ctx.canvas);
    }

    // Clear with negative offset due to Canvas `context.translate(...)`
    $ctx.clearRect(-$padding.left, -$padding.top, $containerWidth, $containerHeight);

    if (render) {
      render($ctx, points);
    } else {
      points.forEach((point) => {
        $ctx.beginPath();
        $ctx.arc(point.x, point.y, r, 0, 2 * Math.PI, false);

        $ctx.lineWidth = Number(strokeWidth ?? 0);
        $ctx.strokeStyle =
          (stroke ?? computedStyles.stroke === 'none')
            ? 'transparent'
            : (computedStyles.stroke ?? '');
        $ctx.stroke();

        $ctx.fillStyle =
          fill ??
          (computedStyles.fill !== DEFAULT_FILL ? computedStyles.fill : undefined) ??
          'transparent';
        $ctx.fill();
      });
    }
  }
</script>

<slot {points}>
  {#if renderContext === 'svg'}
    {#if links}
      <g class="link-group">
        {#each _links as link}
          <Link
            data={link}
            class="stroke-surface-content/50"
            {...typeof links === 'object' ? links : null}
          />
        {/each}
      </g>
    {/if}

    <g class="point-group">
      {#each points as point}
        {@const radialPoint = pointRadial(point.x, point.y)}
        <Circle
          cx={$radial ? radialPoint[0] : point.x}
          cy={$radial ? radialPoint[1] : point.y}
          {r}
          fill={$config.r ? $rGet(point.data) : null}
          class={className}
          {...$$restProps}
        />
      {/each}
    </g>
  {/if}
</slot>
