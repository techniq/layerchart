<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { LabelsProps } from './Labels.shared.svelte.js';

  export type LabelsBaseLayerComponents = {
    Text: Component<any>;
    Group: Component<any>;
    Points: Component<any>;
    /** Leader lines for `layout="voronoi"` with `links`. Omitted on the HTML layer. */
    Link?: Component<any>;
  };

  export type LabelsBaseProps<T = any> = LabelsProps<T> & LabelsBaseLayerComponents;
</script>

<script lang="ts" generics="TData = any">
  import { cls } from '@layerstack/tailwind';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { LabelsState } from './Labels.shared.svelte.js';
  import { getPixelValue } from '../Text/Text.shared.svelte.js';
  import type { Point } from '../Points/Points.shared.svelte.js';

  let {
    Text,
    Group,
    Points,
    Link,
    data,
    value,
    x,
    y,
    seriesKey,
    placement = 'outside',
    layout,
    occlude,
    links,
    offset = placement === 'center' || placement === 'middle' ? 0 : 4,
    format,
    key = (_: any, i: number) => i,
    children: childrenProp,
    class: className,
    fill,
    opacity,
    ...restProps
  }: LabelsBaseProps<TData> = $props();

  const linkProps = $derived(typeof links === 'object' ? links : {});

  const c = new LabelsState<TData>(
    () =>
      ({
        data,
        value,
        x,
        y,
        seriesKey,
        placement,
        layout,
        occlude,
        links,
        offset,
        format,
        fill,
        opacity,
        fontSize: restProps.fontSize,
      }) as LabelsProps<TData>
  );

  // Make the `fontSize` prop win over the `.lc-labels-text` CSS default (a bare
  // `font-size` attribute would lose to the class rule).
  const fontSizeVar = $derived(
    restProps.fontSize != null ? `--labels-font-size: ${getPixelValue(restProps.fontSize)}px` : undefined
  );
</script>

<Group class="lc-labels-g" opacity={c.derivedOpacity as number} style={fontSizeVar}>
  <Points {data} {x} {y} {seriesKey}>
    {#snippet children({ points }: { points: Point[] })}
      {#if layout === 'voronoi'}
        {@const voronoiLabels = c.getVoronoiLabels(points)}
        {#each points as point, i (key(point.data, i))}
          {@const item = voronoiLabels[i]}
          {#if item.visible}
            {@const textProps = extractLayerProps(item.textProps, 'lc-labels-text')}
            {#if childrenProp}
              {@render childrenProp({ data: point, textProps, link: item.link })}
            {:else}
              {#if item.link && Link}
                <Link
                  x1={item.link.x1}
                  y1={item.link.y1}
                  x2={item.link.x2}
                  y2={item.link.y2}
                  type="straight"
                  {...linkProps}
                  class={cls(
                    'lc-labels-link',
                    typeof linkProps.class === 'string' ? linkProps.class : undefined
                  )}
                />
              {/if}
              <Text
                {...textProps}
                {...restProps}
                {...extractLayerProps(item.textProps, 'lc-labels-text', className ?? '')}
              />
            {/if}
          {/if}
        {/each}
      {:else}
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
      {/if}
    {/snippet}
  </Points>
</Group>

<style>
  @layer components {
    :global(:where(.lc-labels-text)) {
      /* var (settable via the `fontSize` prop) so it wins over the presentation attribute */
      font-size: var(--labels-font-size, 12px);

      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: var(--color-surface-100, light-dark(white, black));

      &[data-placement='inside'],
      &[data-placement='center'] {
        --fill-color: var(--color-surface-100, light-dark(white, black));
        --stroke-color: var(--color-surface-content, currentColor);
      }
    }

    :global(:where(.lc-labels-link)) {
      --stroke-color: var(--color-surface-content, currentColor);
      fill: none;
      opacity: 0.4;
      pointer-events: none;
    }
  }
</style>
