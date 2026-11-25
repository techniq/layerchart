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
  import { clsx } from 'clsx';
  import { getMarkData } from '$lib/contexts/facet.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { fontsLoaded } from '$lib/utils/fonts.svelte.js';
  import { getTextStyle } from '$lib/utils/string.js';
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
    z,
    ...restProps
  }: LabelsBaseProps<TData> = $props();

  const linkProps = $derived(typeof links === 'object' ? links : {});

  const geo = getGeoContext();
  const markData = getMarkData();
  /** `layout="shape"`: each label's last position, to keep it from jumping (ex. on resize) */
  const shapeLabelPositions = new Map<any, { u: number; v: number; value: string }>();

  /** A label's height in pixels, from `z` or the chart's, or `undefined` */
  function labelHeight(point: Point) {
    if (z == null && c.ctx.config.z == null) return undefined;
    return c.ctx.heightOf(point.data, z)[1];
  }

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
    restProps.fontSize != null
      ? `--labels-font-size: ${getPixelValue(restProps.fontSize)}px`
      : undefined
  );

  /**
   * `layout="shape"`: the font the labels render in (their class, ex. `font-semibold`, the
   * `fontSize` prop, and what they inherit), to measure whether each fits its shape.  Read again
   * only when the class or size, the chart's width (a responsive class) or web fonts change.
   */
  const shapeTextStyle = $derived.by(() => {
    if (layout !== 'shape') return undefined;
    fontsLoaded();
    c.ctx.containerWidth;
    return getTextStyle(
      c.ctx.containerRef,
      clsx('lc-text', 'lc-labels-text', typeof className === 'string' ? className : undefined),
      undefined,
      fontSizeVar
    );
  });
</script>

<Group class="lc-labels-g" opacity={c.derivedOpacity as number} style={fontSizeVar}>
  {#if layout === 'shape'}
    <!-- Loaded only when used (brings `geoPath` and `shapeLabel`) -->
    {#await import('./Labels.shape.js') then { getShapeLabels }}
      {@const shapeLabels = getShapeLabels({
        ctx: c.ctx,
        projection: geo.projection,
        markData,
        data,
        seriesKey,
        value,
        format,
        fill,
        fontSize: getPixelValue(restProps.fontSize ?? 12),
        style: shapeTextStyle,
        previous: shapeLabelPositions,
      })}
      {#each shapeLabels as label, i (key(label.data, i))}
        <!-- With `occlude`, only the labels that fit within their shape -->
        {#if Number.isFinite(label.x) && (label.fits || !occlude)}
          {@const baseProps = {
            value: label.value,
            fill: label.fill,
            x: label.x,
            y: label.y,
            textAnchor: 'middle' as const,
            verticalAnchor: 'middle' as const,
          }}
          {@const textProps = extractLayerProps(baseProps, 'lc-labels-text')}
          {#if childrenProp}
            {@const point = {
              x: label.x,
              y: label.y,
              r: 0,
              xValue: undefined,
              yValue: undefined,
              data: label.data,
            }}
            {@render childrenProp({ data: point, textProps })}
          {:else}
            <Text
              data-layout="shape"
              {...textProps}
              {...restProps}
              {...extractLayerProps(baseProps, 'lc-labels-text', className ?? '')}
            />
          {/if}
        {/if}
      {/each}
    {/await}
  {:else}
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
                    class={clsx(
                      'lc-labels-link',
                      typeof linkProps.class === 'string' ? linkProps.class : undefined
                    )}
                  />
                {/if}
                <Text
                  {...textProps}
                  {...restProps}
                  z={labelHeight(point)}
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
                z={labelHeight(point)}
                {...extractLayerProps(baseProps, 'lc-labels-text', className ?? '')}
              />
            {/if}
          {/each}
        {/if}
      {/snippet}
    </Points>
  {/if}
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
