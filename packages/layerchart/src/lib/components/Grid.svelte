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
    GridPropsWithoutHTML<In> & Without<GroupProps, GridPropsWithoutHTML<In>>,
    'children'
  >;
</script>

<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicIn } from 'svelte/easing';

  import { curveLinearClosed, pointRadial } from 'd3-shape';

  import { cls } from '@layerstack/tailwind';

  import { isScaleBand } from '$lib/utils/scales.svelte.js';

  import Circle from './Circle.svelte';
  import Group, { type GroupProps } from './Group.svelte';
  import Line from './Line.svelte';
  import Rule from './Rule.svelte';
  import Spline from './Spline.svelte';
  import { getChartContext } from './Chart.svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { autoTickVals, type TicksConfig } from '$lib/utils/ticks.js';

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
    ref: refProp = $bindable(),
    ...restProps
  }: GridProps = $props();

  let ref = $state<SVGGElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const yTicks = $derived(yTicksProp ?? (!isScaleBand(ctx.yScale) ? 4 : undefined));

  const tweenConfig = $derived(extractTweenConfig(motion));

  const transitionIn = $derived((transitionInProp ?? tweenConfig?.options) ? fade : () => ({}));

  const xTickVals = $derived(autoTickVals(ctx.xScale, xTicks));
  const yTickVals = $derived(autoTickVals(ctx.yScale, yTicks));

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

<Group bind:ref class={cls('lc-grid', classes.root, className)} {...restProps}>
  {#if x}
    {@const splineProps = extractLayerProps(x, 'grid-x-line')}

    <Group {transitionIn} {transitionInParams} class="lc-grid-x">
      {#each xTickVals as x (x)}
        {#if ctx.radial}
          {@const [x1, y1] = pointRadial(ctx.xScale(x), ctx.yRange[0])}
          {@const [x2, y2] = pointRadial(ctx.xScale(x), ctx.yRange[1])}
          <Line
            {x1}
            {y1}
            {x2}
            {y2}
            motion={tweenConfig}
            {...splineProps}
            class={cls(
              'lc-grid-x-radial-line',
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
              'lc-grid-x-rule',
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
          xOffset={ctx.xScale.step() + xBandOffset}
          {motion}
          {...splineProps}
          class={cls(
            'lc-grid-x-end-rule',
            'stroke-surface-content/10',
            classes.line,
            splineProps?.class
          )}
        />
      {/if}
    </Group>
  {/if}

  {#if y}
    {@const splineProps = extractLayerProps(y, 'grid-y-line')}
    <Group {transitionIn} {transitionInParams} class="lc-grid-y">
      {#each yTickVals as y (y)}
        {#if ctx.radial}
          {#if radialY === 'circle'}
            <Circle
              r={ctx.yScale(y) + yBandOffset}
              {motion}
              {...splineProps}
              class={cls(
                'lc-grid-y-radial-circle',
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
                'lc-grid-y-radial-line',
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
              'lc-grid-y-rule',
              'stroke-surface-content/10',
              classes.line,
              splineProps?.class
            )}
          />
        {/if}
      {/each}

      <!-- Add extra rule after last band -->
      {#if isScaleBand(ctx.yScale) && bandAlign === 'between' && yTickVals.length}
        {#if ctx.radial}
          <Circle
            r={ctx.yScale(yTickVals[yTickVals.length - 1])! + ctx.yScale.step() + yBandOffset}
            {motion}
            {...splineProps}
            class={cls(
              'lc-grid-y-radial-circle',
              'fill-none stroke-surface-content/10',
              classes.line,
              splineProps?.class
            )}
          />
        {:else}
          <Rule
            y={yTickVals[yTickVals.length - 1]}
            yOffset={ctx.yScale.step() + yBandOffset}
            {motion}
            {...splineProps}
            class={cls(
              'lc-grid-y-end-rule',
              'stroke-surface-content/10',
              classes.line,
              splineProps?.class
            )}
          />
        {/if}
      {/if}
    </Group>
  {/if}
</Group>
