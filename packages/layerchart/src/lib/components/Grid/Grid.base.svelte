<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { Transition } from '$lib/utils/types.js';
  import type { GridProps } from './Grid.shared.svelte.js';

  /**
   * Per-layer primitive components a `<Grid.base>` consumer must inject.
   */
  export type GridBaseLayerComponents = {
    Group: Component<any>;
    Line: Component<any>;
    Circle: Component<any>;
    Rule: Component<any>;
  };

  export type GridBaseProps<In extends Transition = Transition> = GridProps<In> &
    GridBaseLayerComponents;
</script>

<script lang="ts" generics="T extends Transition = Transition">
  import { curveLinearClosed, pointRadial } from 'd3-shape';

  import { cls } from '@layerstack/tailwind';

  import { isScaleBand } from '$lib/utils/scales.svelte.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  import { GridState } from './Grid.shared.svelte.js';
  import { getLayerIsometric } from '$lib/contexts/isometric.js';
  import { backWalls } from '$lib/utils/isometric.js';

  let {
    Group,
    Line,
    Circle,
    Rule,
    x = false,
    y = false,
    z = false,
    xTicks,
    yTicks,
    zTicks,
    bandAlign = 'center',
    radialY = 'circle',
    stroke,
    motion,
    transitionIn: transitionInProp,
    transitionInParams: transitionInParamsProp,
    classes = {},
    class: className,
    ref: refProp = $bindable(),
    ...restProps
  }: GridBaseProps<T> = $props();

  const c = new GridState(
    () =>
      ({
        x,
        y,
        z,
        xTicks,
        yTicks,
        zTicks,
        bandAlign,
        radialY,
        stroke,
        motion,
        transitionIn: transitionInProp,
        transitionInParams: transitionInParamsProp,
        classes,
      }) as any
  );

  let ref = $state<Element>();

  $effect.pre(() => {
    refProp = ref as any;
  });

  const layerIsometric = getLayerIsometric();

  /**
   * For `z`: the back walls of an `isometric` chart with a `z`, and how far up the screen one
   * pixel of height is — `null` where there are no walls to draw on.
   */
  const walls = $derived.by(() => {
    const m = layerIsometric();
    const lift = c.ctx.isometricLift;
    const depth = c.ctx.zDepth;
    if (!z || !m || !lift || c.ctx.props.z == null || depth <= 0) return null;
    return { lift, depth, edges: backWalls({ width: c.ctx.width, height: c.ctx.height }, m) };
  });

  /** A point on the floor raised by `height` pixels */
  function raise(p: { x: number; y: number }, height: number) {
    const lift = walls!.lift;
    return { x: p.x + lift.x * height, y: p.y + lift.y * height };
  }

  const transitionIn = $derived(transitionInProp ?? c.defaultTransitionIn) as T;
  const transitionInParams = $derived(transitionInParamsProp ?? c.defaultTransitionInParams);
</script>

<Group bind:ref class={cls('lc-grid', classes.root, className)} {...restProps}>
  {#if x}
    {@const splineProps = extractLayerProps(x, 'lc-grid-x-line')}

    <Group {transitionIn} {transitionInParams} class="lc-grid-x">
      {#each c.xTickVals as tick (tick)}
        {#if c.ctx.radial}
          {@const [x1, y1] = pointRadial(c.ctx.xScale(tick), c.ctx.yRange[0])}
          {@const [x2, y2] = pointRadial(c.ctx.xScale(tick), c.ctx.yRange[1])}
          <Line
            {x1}
            {y1}
            {x2}
            {y2}
            {stroke}
            motion={c.tweenConfig}
            {...splineProps}
            class={cls('lc-grid-x-radial-line', classes.line, splineProps?.class)}
          />
        {:else}
          <Rule
            x={tick}
            xOffset={c.xBandOffset}
            {stroke}
            {motion}
            {...splineProps}
            class={cls('lc-grid-x-rule', classes.line, splineProps?.class)}
          />
        {/if}
      {/each}

      <!-- Add extra rule after last band -->
      {#if isScaleBand(c.ctx.xScale) && bandAlign === 'between' && !c.ctx.radial && c.xTickVals.length}
        <Rule
          x={c.xTickVals[c.xTickVals.length - 1]}
          xOffset={c.ctx.xScale.step() + c.xBandOffset}
          {stroke}
          {motion}
          {...splineProps}
          class={cls('lc-grid-x-end-rule', classes.line, splineProps?.class)}
        />
      {/if}
    </Group>
  {/if}

  {#if y}
    {@const splineProps = extractLayerProps(y, 'lc-grid-y-line')}
    <Group {transitionIn} {transitionInParams} class="lc-grid-y">
      {#each c.yTickVals as tick (tick)}
        {#if c.ctx.radial}
          {#if radialY === 'circle'}
            <Circle
              r={c.ctx.yScale(tick) + c.yBandOffset}
              {stroke}
              {motion}
              {...splineProps}
              class={cls('lc-grid-y-radial-circle', classes.line, splineProps?.class)}
            />
          {:else}
            {#await import('../Spline/Spline.svelte') then { default: Spline }}
              <Spline
                data={c.xTickVals.map((tx) => ({ x: tx, y: tick }))}
                x="x"
                y="y"
                {stroke}
                motion={c.tweenConfig}
                curve={curveLinearClosed}
                {...splineProps}
                class={cls('lc-grid-y-radial-line', classes.line, splineProps?.class)}
              />
            {/await}
          {/if}
        {:else}
          <Line
            x1={c.ctx.xRange[0]}
            y1={c.ctx.yScale(tick) + c.yBandOffset}
            x2={c.ctx.xRange[1]}
            y2={c.ctx.yScale(tick) + c.yBandOffset}
            {stroke}
            {motion}
            {...splineProps}
            class={cls('lc-grid-y-rule', classes.line, splineProps?.class)}
          />
        {/if}
      {/each}

      <!-- Add extra rule after last band -->
      {#if isScaleBand(c.ctx.yScale) && bandAlign === 'between' && c.yTickVals.length}
        {#if c.ctx.radial}
          <Circle
            r={c.ctx.yScale(c.yTickVals[c.yTickVals.length - 1])! +
              c.ctx.yScale.step() +
              c.yBandOffset}
            {stroke}
            {motion}
            {...splineProps}
            class={cls('lc-grid-y-radial-circle', classes.line, splineProps?.class)}
          />
        {:else}
          {@const yEnd =
            c.ctx.yScale(c.yTickVals[c.yTickVals.length - 1])! +
            c.ctx.yScale.step() +
            c.yBandOffset}
          <Line
            x1={c.ctx.xRange[0]}
            y1={yEnd}
            x2={c.ctx.xRange[1]}
            y2={yEnd}
            {stroke}
            {motion}
            {...splineProps}
            class={cls('lc-grid-y-end-rule', classes.line, splineProps?.class)}
          />
        {/if}
      {/if}
    </Group>
  {/if}

  {#if walls}
    {@const zProps = extractLayerProps(z, 'lc-grid-z-line')}
    <Group {transitionIn} {transitionInParams} class="lc-grid-z">
      {#each walls.edges as edge}
        <!-- Across the wall at each height -->
        {#each c.zTickVals as tick (tick)}
          {@const a = raise(edge.from, c.ctx.zScale(tick))}
          {@const b = raise(edge.to, c.ctx.zScale(tick))}
          <Line
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            {stroke}
            {...zProps}
            class={cls('lc-grid-z-rule', classes.line, zProps?.class)}
          />
        {/each}

        <!-- Up the wall, continuing the floor's gridlines along the edge it stands on -->
        {#if edge.axis === 'x' ? x : y}
          {#each edge.axis === 'x' ? c.xTickVals : c.yTickVals as tick (tick)}
            {@const foot =
              edge.axis === 'x'
                ? { x: c.ctx.xScale(tick) + c.xBandOffset, y: edge.from.y }
                : { x: edge.from.x, y: c.ctx.yScale(tick) + c.yBandOffset }}
            {@const top = raise(foot, walls.depth)}
            <Line
              x1={foot.x}
              y1={foot.y}
              x2={top.x}
              y2={top.y}
              {stroke}
              {...zProps}
              class={cls('lc-grid-z-rule', classes.line, zProps?.class)}
            />
          {/each}
        {/if}
      {/each}
    </Group>
  {/if}
</Group>

<style>
  @layer components {
    :global(
      :where(
        .lc-grid-x-rule,
        .lc-grid-x-end-rule,
        .lc-grid-x-radial-line,
        .lc-grid-y-rule,
        .lc-grid-y-end-rule,
        .lc-grid-z-rule,
        .lc-grid-y-radial-line
      )
    ) {
      --stroke-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 10%,
        transparent
      );
    }

    :global(:where(.lc-grid-y-radial-circle)) {
      --fill-color: none;
      --stroke-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 10%,
        transparent
      );
    }
  }
</style>
