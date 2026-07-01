<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { RuleProps } from './Rule.shared.svelte.js';

  /**
   * Per-layer primitive components a `<Rule.base>` consumer must inject.
   */
  export type RuleBaseLayerComponents = {
    Group: Component<any>;
    Line: Component<any>;
    Circle: Component<any>;
  };

  export type RuleBaseProps = RuleProps & RuleBaseLayerComponents;
</script>

<script lang="ts">
  import { pointRadial } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import { RuleState } from './Rule.shared.svelte.js';

  let {
    Group,
    Line,
    Circle,
    data: dataProp,
    x = false,
    xOffset = 0,
    y = false,
    yOffset = 0,
    stroke: strokeProp,
    class: className,
    children,
    ...restProps
  }: RuleBaseProps = $props();

  const c = new RuleState(
    () =>
      ({
        data: dataProp,
        x,
        xOffset,
        y,
        yOffset,
        stroke: strokeProp,
      }) as any
  );
</script>

<Group class="lc-rule-g">
  {#each c.lines as line}
    {@const stroke = line.stroke ?? strokeProp}

    {#if c.ctx.radial}
      {#if line.axis === 'x'}
        {@const [x1, y1] = pointRadial(line.x1, line.y1)}
        {@const [x2, y2] = pointRadial(line.x2, line.y2)}
        <Line
          {...restProps}
          {x1}
          {y1}
          {x2}
          {y2}
          {stroke}
          class={cls('lc-rule-x-radial-line', className)}
        />
      {:else if line.axis === 'y'}
        <Circle r={line.y1} {stroke} class={cls('lc-rule-y-radial-circle', className)} />
      {/if}
    {:else}
      <Line
        {...restProps}
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        {stroke}
        class={cls(line.axis === 'x' ? 'lc-rule-x-line' : 'lc-rule-y-line', className)}
      />
    {/if}
  {/each}
</Group>

<style>
  @layer components {
    /* TODO: better way to handle this without affecting other components? */
    /* Could add a layer between "components" and "base" but would require more setup (and not align with TW layers) */
    :global(
      :where(
        .lc-rule-x-line,
        .lc-rule-y-line,
        .lc-rule-x-radial-line,
        .lc-rule-y-radial-circle
      ):not([class*='lc-axis'], [class*='lc-grid'])
    ) {
      --stroke-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 50%,
        transparent
      );
    }

    :global(:where(.lc-rule-y-radial-circle)) {
      --fill-color: none;
    }
  }
</style>
