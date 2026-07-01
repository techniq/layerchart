<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { LabelsProps } from './Labels.shared.svelte.js';

  export type LabelsBaseLayerComponents = {
    Text: Component<any>;
    Group: Component<any>;
    Points: Component<any>;
  };

  export type LabelsBaseProps<T = any> = LabelsProps<T> & LabelsBaseLayerComponents;
</script>

<script lang="ts" generics="TData = any">
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { LabelsState } from './Labels.shared.svelte.js';
  import type { Point } from '../Points/Points.shared.svelte.js';

  let {
    Text,
    Group,
    Points,
    data,
    value,
    x,
    y,
    seriesKey,
    placement = 'outside',
    offset = placement === 'center' || placement === 'middle' ? 0 : 4,
    format,
    key = (_: any, i: number) => i,
    children: childrenProp,
    class: className,
    fill,
    opacity,
    ...restProps
  }: LabelsBaseProps<TData> = $props();

  const c = new LabelsState<TData>(
    () =>
      ({
        data,
        value,
        x,
        y,
        seriesKey,
        placement,
        offset,
        format,
        fill,
        opacity,
      }) as LabelsProps<TData>
  );
</script>

<Group class="lc-labels-g" opacity={c.derivedOpacity as number}>
  <Points {data} {x} {y} {seriesKey}>
    {#snippet children({ points }: { points: Point[] })}
      {#each points as point, i (key(point.data, i))}
        {@const baseProps = c.getTextProps(point, points, i)}
        {@const textProps = extractLayerProps(baseProps, 'lc-labels-text')}
        {#if childrenProp}
          {@render childrenProp({ data: point, textProps })}
        {:else}
          <Text
            data-placement={placement}
            {...textProps}
            {...restProps}
            {...extractLayerProps(baseProps, 'lc-labels-text', className ?? '')}
          />
        {/if}
      {/each}
    {/snippet}
  </Points>
</Group>

<style>
  @layer components {
    :global(:where(.lc-labels-text)) {
      font-size: 12px;

      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: var(--color-surface-100, light-dark(white, black));

      &[data-placement='inside'],
      &[data-placement='center'] {
        --fill-color: var(--color-surface-100, light-dark(white, black));
        --stroke-color: var(--color-surface-content, currentColor);
      }
    }
  }
</style>
