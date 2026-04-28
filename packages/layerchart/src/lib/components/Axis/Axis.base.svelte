<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { Transition } from '$lib/utils/types.js';
  import type { AxisProps } from './Axis.shared.svelte.js';

  /**
   * Per-layer primitive components a `<Axis.base>` consumer must inject.
   * Each per-layer variant (`Axis.svg.svelte`, etc.) imports the matching
   * primitive variants and forwards them here so the template stays in
   * one place.
   */
  export type AxisBaseLayerComponents = {
    Group: Component<any>;
    Line: Component<any>;
    Text: Component<any>;
    Rule: Component<any>;
  };

  export type AxisBaseProps<In extends Transition = Transition> = AxisProps<In> &
    AxisBaseLayerComponents;
</script>

<script lang="ts" generics="T extends Transition = Transition">
  import { cls } from '@layerstack/tailwind';

  import { extractLayerProps } from '$lib/utils/attributes.js';

  import { AxisState } from './Axis.shared.svelte.js';

  let {
    Group,
    Line,
    Text,
    Rule,
    placement,
    label = '',
    labelPlacement = 'middle',
    labelProps,
    rule = false,
    grid = false,
    ticks,
    tickSpacing,
    tickMultiline = false,
    tickLength = 4,
    tickMarks = true,
    format,
    tickLabelProps,
    stroke,
    fill,
    motion,
    transitionIn,
    transitionInParams,
    scale,
    classes = {},
    class: className,
    tickLabel,
    ...restProps
  }: AxisBaseProps<T> = $props();

  const c = new AxisState(
    () =>
      ({
        placement,
        label,
        labelPlacement,
        labelProps,
        rule,
        grid,
        ticks,
        tickSpacing,
        tickMultiline,
        tickLength,
        tickMarks,
        format,
        tickLabelProps,
        stroke,
        fill,
        motion,
        scale,
        classes,
      }) as AxisProps
  );
</script>

<Group
  {...restProps}
  data-placement={placement}
  class={cls('lc-axis', `placement-${placement}`, classes.root, className)}
>
  {#if rule !== false}
    <Rule
      x={placement === 'left' ? '$left' : placement === 'right' ? '$right' : placement === 'angle'}
      y={placement === 'top' ? '$top' : placement === 'bottom' ? '$bottom' : placement === 'radius'}
      {stroke}
      {motion}
      {...extractLayerProps(rule, 'lc-axis-rule', classes.rule ?? '')}
    />
  {/if}

  {#if typeof label === 'function'}
    {@render label({ props: c.resolvedLabelProps })}
  {:else if label}
    <Text {...c.resolvedLabelProps} />
  {/if}

  {#each c.tickItems as item, index (item.key)}
    <Group {transitionIn} {transitionInParams} class="lc-axis-tick-group">
      {#if grid !== false}
        <Rule
          x={c.orientation === 'horizontal' || c.orientation === 'angle' ? item.tick : false}
          y={c.orientation === 'vertical' || c.orientation === 'radius' ? item.tick : false}
          {stroke}
          {motion}
          {...extractLayerProps(grid, 'lc-axis-grid', classes.rule ?? '')}
        />
      {/if}

      {#if tickMarks}
        {@const tickClasses = cls('lc-axis-tick', classes.tick)}
        {#if c.orientation === 'horizontal'}
          <Line
            x1={item.tickCoordsX}
            y1={item.tickCoordsY}
            x2={item.tickCoordsX}
            y2={item.tickCoordsY + (placement === 'top' ? -tickLength : tickLength)}
            {stroke}
            {motion}
            class={tickClasses}
          />
        {:else if c.orientation === 'vertical'}
          <Line
            x1={item.tickCoordsX}
            y1={item.tickCoordsY}
            x2={item.tickCoordsX + (placement === 'left' ? -tickLength : tickLength)}
            y2={item.tickCoordsY}
            {stroke}
            {motion}
            class={tickClasses}
          />
        {:else if c.orientation === 'angle'}
          <Line
            x1={item.radialTickCoordsX}
            y1={item.radialTickCoordsY}
            x2={item.radialTickMarkCoordsX}
            y2={item.radialTickMarkCoordsY}
            {stroke}
            {motion}
            class={tickClasses}
          />
        {/if}
      {/if}

      {#if tickLabel}
        {@render tickLabel({ props: item.tickLabelProps, index })}
      {:else}
        <Text {...item.tickLabelProps} />
      {/if}
    </Group>
  {/each}
</Group>

<style>
  @layer components {
    :global(:where(.lc-axis-rule)) {
      --stroke-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 50%,
        transparent
      );
    }

    :global(:where(.lc-axis-tick)) {
      --stroke-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 50%,
        transparent
      );
    }

    :global(:where(.lc-axis-grid)) {
      --stroke-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 10%,
        transparent
      );
    }

    :global(:where(.lc-axis-label, .lc-axis-tick-label)) {
      font-size: 10px;
      stroke: var(--color-surface-100, light-dark(white, black));
      stroke-width: 2px;
      font-weight: 300;
    }
  }
</style>
