<script lang="ts" module>
  import type { Transition, TransitionParams, Without } from '$lib/utils/types.js';
  import { extractTweenConfig, type MotionProp } from '$lib/utils/motion.svelte.js';
  import type { SVGAttributes } from 'svelte/elements';

  export type GridPropsWithoutHTML<In extends Transition = Transition> = {
    /**
     * Draw a x-axis lines
     *
     * @default false
     */
    x?: boolean | Pick<SVGAttributes<SVGElement>, 'class' | 'style'>;

    /**
     * Draw a y-axis lines
     *
     * @default false
     */
    y?: boolean | Pick<SVGAttributes<SVGElement>, 'class' | 'style'>;

    /**
     * Control the number of x-axis ticks
     */
    xTicks?: TicksConfig;

    /**
     * Control the number of y-axis ticks
     *
     * @default !isScaleBand(ctx.yScale) ? 4 : undefined
     */
    yTicks?: TicksConfig;

    /**
     * Line alignment when band scale is used (x or y axis)
     *
     * @default 'center'
     */
    bandAlign?: 'center' | 'between';

    /**
     * Render `y` lines with circles or linear splines
     *
     * @default 'circle'
     */
    radialY?: 'circle' | 'linear';

    /**
     * Classes to apply to the rendered elements.
     *
     * @default {}
     */
    classes?: {
      root?: string;
      line?: string;
    };

    /**
     * Transition function for entering elements
     * @default  defaults to fade if motion is tweened
     */
    transitionIn?: In;

    /**
     * Parameters for the transitionIn function
     * @default { easing: cubicIn }
     */
    transitionInParams?: TransitionParams<In>;

    /**
     * A reference to the underlying outermost `<g>` element.
     *
     * @bindable
     */
    ref?: SVGGElement;

    motion?: MotionProp;
  };

  export type GridProps<In extends Transition = Transition> = Omit<
    GridPropsWithoutHTML<In> & Without<SVGAttributes<SVGGElement>, GridPropsWithoutHTML<In>>,
    'children'
  >;
</script>

<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicIn } from 'svelte/easing';

  import { curveLinearClosed } from 'd3-shape';

  import { cls } from '@layerstack/tailwind';

  import { isScaleBand, type AnyScale } from '$lib/utils/scales.svelte.js';

  import Rule from './Rule.svelte';
  import Spline from './Spline.svelte';
  import Circle from './Circle.svelte';
  import { getChartContext } from './Chart.svelte';
  import { extractLayerProps, layerClass } from '$lib/utils/attributes.js';
  import { resolveTickVals, type TicksConfig } from '$lib/utils/ticks.js';

  const ctx = getChartContext();

  let {
    x = false,
    y = false,
    xTicks,
    yTicks: yTicksProp,
    bandAlign = 'center',
    radialY = 'circle',
    motion,
    transitionIn: transitionInProp,
    transitionInParams = { easing: cubicIn },
    classes = {},
    class: className,
    ref = $bindable(),
    ...restProps
  }: GridProps = $props();

  const yTicks = $derived(yTicksProp ?? (!isScaleBand(ctx.yScale) ? 4 : undefined));

  const tweenConfig = $derived(extractTweenConfig(motion));

  const transitionIn = $derived((transitionInProp ?? tweenConfig?.options) ? fade : () => ({}));

  const xTickVals = $derived(resolveTickVals(ctx.xScale, xTicks));
  const yTickVals = $derived(resolveTickVals(ctx.yScale, yTicks));

  const xBandOffset = $derived(
    isScaleBand(ctx.xScale)
      ? bandAlign === 'between'
        ? -(ctx.xScale.padding() * ctx.xScale.step()) / 2 // before
        : ctx.xScale.step() / 2 - (ctx.xScale.padding() * ctx.xScale.step()) / 2 // center
      : 0
  );

  const yBandOffset = $derived(
    isScaleBand(ctx.yScale)
      ? bandAlign === 'between'
        ? -(ctx.yScale.padding() * ctx.yScale.step()) / 2 // before
        : ctx.yScale.step() / 2 - (ctx.yScale.padding() * ctx.yScale.step()) / 2 // center
      : 0
  );
</script>

<g bind:this={ref} class={cls(layerClass('grid'), classes.root, className)} {...restProps}>
  {#if x}
    {@const splineProps = extractLayerProps(x, 'grid-x-line')}

    <g in:transitionIn={transitionInParams} class={layerClass('grid-x')}>
      {#each xTickVals as x (x)}
        {#if ctx.radial}
          <Spline
            data={yTickVals.map((y) => ({ x, y }))}
            x="x"
            y="y"
            curve={curveLinearClosed}
            motion={tweenConfig}
            {...splineProps}
            class={cls(
              layerClass('grid-x-radial-line'),
              'stroke-surface-content/10',
              classes.line,
              splineProps?.class
            )}
          />
        {:else}
          <Rule
            {x}
            xOffset={xBandOffset}
            {motion}
            {...splineProps}
            class={cls(
              layerClass('grid-x-rule'),
              'stroke-surface-content/10',
              classes.line,
              splineProps?.class
            )}
          />
        {/if}
      {/each}

      <!-- Add extra rule after last band -->
      {#if isScaleBand(ctx.xScale) && bandAlign === 'between' && !ctx.radial && xTickVals.length}
        <Rule
          x={xTickVals[xTickVals.length - 1]}
          xOffset={xBandOffset + ctx.xScale.step()}
          {motion}
          {...splineProps}
          class={cls(
            layerClass('grid-x-end-rule'),
            'stroke-surface-content/10',
            classes.line,
            splineProps?.class
          )}
        />
      {/if}
    </g>
  {/if}

  {#if y}
    {@const splineProps = extractLayerProps(y, 'grid-y-line')}
    <g in:transitionIn={transitionInParams} class={layerClass('grid-y')}>
      {#each yTickVals as y (y)}
        {#if ctx.radial}
          {#if radialY === 'circle'}
            <Circle
              r={ctx.yScale(y)}
              {motion}
              {...splineProps}
              class={cls(
                layerClass('grid-y-radial-circle'),
                'fill-none stroke-surface-content/10',
                classes.line,
                splineProps?.class
              )}
            />
          {:else}
            <Spline
              data={xTickVals.map((x) => ({ x, y }))}
              x="x"
              y="y"
              motion={tweenConfig}
              curve={curveLinearClosed}
              {...splineProps}
              class={cls(
                layerClass('grid-y-radial-line'),
                'stroke-surface-content/10',
                classes.line,
                splineProps?.class
              )}
            />
          {/if}
        {:else}
          <Rule
            {y}
            yOffset={yBandOffset}
            {motion}
            {...splineProps}
            class={cls(
              layerClass('grid-y-rule'),
              'stroke-surface-content/10',
              classes.line,
              splineProps?.class
            )}
          />
        {/if}
      {/each}

      <!-- Add extra rule after last band -->
      {#if isScaleBand(ctx.yScale) && bandAlign === 'between' && !ctx.radial && yTickVals.length}
        <Rule
          y={yTickVals[yTickVals.length - 1]}
          yOffset={yBandOffset + ctx.yScale.step()}
          {motion}
          {...splineProps}
          class={cls(
            layerClass('grid-y-end-rule'),
            'stroke-surface-content/10',
            classes.line,
            splineProps?.class
          )}
        />
      {/if}
    </g>
  {/if}
</g>
