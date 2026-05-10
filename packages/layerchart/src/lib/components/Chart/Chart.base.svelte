<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import type { ChartProps } from './Chart.shared.svelte.js';

  export type ChartBaseProps<
    T,
    XScale extends AnyScale = AnyScale,
    YScale extends AnyScale = AnyScale,
  > = ChartProps<T, XScale, YScale> & {
    /**
     * The `ChartChildren` component to render inside the chart. Per-layer
     * variants (`Chart.svg.svelte` etc.) inject the matching per-layer
     * `ChartChildren` so the underlying primitive imports are layer-specific.
     *
     * When undefined (used by `ChartCore`), the `children` snippet is rendered
     * directly without `ChartChildren` — skipping the `Axis` / `Grid` / `Rule` /
     * `Highlight` / `ChartClipPath` / `Layer` import chain.
     */
    ChartChildren?: Component<any>;
  };
</script>

<script
  lang="ts"
  generics="TData = any, XScale extends AnyScale = AnyScale, YScale extends AnyScale = AnyScale"
>
  import { setGeoContext } from '$lib/contexts/geo.js';
  import { getSettings } from '$lib/contexts/settings.js';
  import { setChartContext } from '$lib/contexts/chart.js';
  import { ChartState } from '$lib/states/chart.svelte.js';
  import type { ChartPropsWithoutHTML } from './Chart.shared.svelte.js';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';
  import { getObjectOrNull } from '$lib/utils/common.js';
  import {
    type BrushDomainType,
    type BrushState,
    expandBandBrushDomain,
  } from '$lib/states/brush.svelte.js';

  import TooltipContext from '../tooltip/TooltipContext.svelte';

  let {
    ChartChildren,
    ref: refProp = $bindable(),
    context: contextProp = $bindable(),
    ...props
  }: ChartBaseProps<TData, XScale, YScale> = $props();

  let {
    ssr = false,
    pointerEvents = true,
    width,
    height,
    position = 'relative',
    children,
    geo,
    tooltipContext,
    transform,
    onTransform,
    ondragend,
    ondragstart,
    brush,
    motion,
    debug = false,
    clip = false,
    onTooltipClick,
    class: className,
    ...restProps
  } = $derived(props);

  let brushXDomain = $state<BrushDomainType>();
  let brushYDomain = $state<BrushDomainType>();

  // Pass the `$props()` proxy directly — `props.X` reads stay reactive and
  // don't pay the cost of an `{...props}` spread (recursive `ownKeys` across
  // nested rest/spread proxies). Brush selections are supplied as getters so
  // the chart's domain calculation can layer them on top of `props.xDomain`
  // / `props.yDomain` at the read sites.
  const chartState = new ChartState<TData, XScale, YScale>(
    props as ChartPropsWithoutHTML<TData, XScale, YScale>,
    {
      brushXDomain: () => brushXDomain,
      brushYDomain: () => brushYDomain,
    }
  );

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
    chartState.containerRef = ref;
  });

  // Update bindable
  contextProp = chartState;

  setChartContext(chartState);
  setGeoContext(chartState.geoState);

  const settings = getSettings();
  $effect(() => {
    settings.debug = debug;
  });

  // Resolve which projection properties the transform state applies to
  const resolvedApply = $derived.by(() => {
    if (transform?.mode !== 'projection')
      return { rotation: false, scale: false, translate: false };

    // Auto-detect globe projections from clipAngle (flat projections return 0, globes return > 0)
    let isGlobe = false;
    if (geo?.projection) {
      const proj = geo.projection();
      isGlobe = (proj.clipAngle?.() ?? 0) > 0;
    }

    const defaults = isGlobe
      ? { rotation: true, scale: true, translate: false }
      : { rotation: false, scale: true, translate: true };

    const result = { ...defaults, ...transform?.apply };
    if (transform?.apply?.rotation === true && transform?.apply?.translate == null) {
      result.translate = false;
    }
    if (transform?.apply?.translate === true && transform?.apply?.rotation == null) {
      result.rotation = false;
    }

    return result;
  });

  $effect.pre(() => {
    if (chartState.geoState) {
      chartState.geoState.transformApply = resolvedApply;
    }
  });

  const initialTransform = $derived.by(() => {
    if (
      transform?.mode !== 'projection' ||
      !(resolvedApply.translate || resolvedApply.scale) ||
      !geo?.fitGeojson ||
      !geo?.projection
    ) {
      return undefined;
    }
    const fitted = geo.projection().fitSize([chartState.width, chartState.height], geo.fitGeojson);
    const t = fitted.translate();
    return { translate: { x: t[0], y: t[1] }, scale: fitted.scale() };
  });

  const processTranslate = $derived.by(() => {
    if (resolvedApply.rotation && chartState.geoState?.projection) {
      return (x: number, y: number, deltaX: number, deltaY: number) => {
        const projectionScale = chartState.geoState.projection!.scale() ?? 0;
        const sensitivity = 75;
        return {
          x: x + deltaX * (sensitivity / projectionScale),
          y: y + deltaY * (sensitivity / projectionScale) * -1,
        };
      };
    }
    return undefined;
  });

  const domainExtentConstrain = $derived.by(() => {
    const de = transform?.domainExtent;
    if (!de) return undefined;

    return (t: { scale: number; translate: { x: number; y: number } }) => {
      let { scale, translate } = t;

      const resolveValue = (
        val: number | Date | 'data' | undefined,
        baseDomainValue: unknown
      ): number | undefined => {
        if (val === undefined) return undefined;
        if (val === 'data') {
          if (baseDomainValue instanceof Date) return baseDomainValue.getTime();
          return baseDomainValue as number;
        }
        if (val instanceof Date) return val.getTime();
        return val;
      };

      const constrainAxis = (
        axisTranslate: number,
        axisScale: number,
        dimension: number,
        baseDomain: number[],
        extent:
          | { min?: number | Date | 'data'; max?: number | Date | 'data'; minRange?: number }
          | undefined
      ): number => {
        if (!extent || baseDomain.length < 2 || dimension <= 0) return axisTranslate;

        const d0 = baseDomain[0] as unknown;
        const d1 = baseDomain[1] as unknown;

        if (typeof d0 === 'string') return axisTranslate;
        const isDate = d0 instanceof Date;
        const rawD0 = isDate ? (d0 as Date).getTime() : (d0 as number);
        const rawD1 = isDate ? (d1 as Date).getTime() : (d1 as number);
        const range = Math.abs(rawD1 - rawD0);
        if (!isFinite(range) || range === 0) return axisTranslate;

        const reversed = rawD0 > rawD1;
        const normTranslate = reversed
          ? dimension * axisScale - axisTranslate - dimension
          : axisTranslate;
        const numMin = Math.min(rawD0, rawD1);

        const rawMinVal = resolveValue(extent.min, baseDomain[0]);
        const rawMaxVal = resolveValue(extent.max, baseDomain[1]);
        const minVal =
          rawMinVal != null && rawMaxVal != null ? Math.min(rawMinVal, rawMaxVal) : rawMinVal;
        const maxVal =
          rawMinVal != null && rawMaxVal != null ? Math.max(rawMinVal, rawMaxVal) : rawMaxVal;

        const f0 = -normTranslate / axisScale / dimension;
        const f1 = (dimension - normTranslate) / axisScale / dimension;
        let visMin = numMin + f0 * range;
        let visMax = numMin + f1 * range;
        const visRange = visMax - visMin;

        if (extent.minRange != null && visRange < extent.minRange) {
          const center = (visMin + visMax) / 2;
          visMin = center - extent.minRange / 2;
          visMax = center + extent.minRange / 2;
        }

        if (minVal != null && visMin < minVal) {
          visMin = minVal;
          visMax =
            visMin +
            (extent.minRange != null && visRange < extent.minRange ? extent.minRange : visRange);
        }
        if (maxVal != null && visMax > maxVal) {
          visMax = maxVal;
          visMin =
            visMax -
            (extent.minRange != null && visRange < extent.minRange ? extent.minRange : visRange);
          if (minVal != null && visMin < minVal) visMin = minVal;
        }

        const newF0 = (visMin - numMin) / range;
        const result = -newF0 * axisScale * dimension;
        return reversed ? dimension * axisScale - result - dimension : result;
      };

      const transformAxis = transform?.axis ?? 'both';

      if (de.x && (transformAxis === 'x' || transformAxis === 'both') && chartState.width > 0) {
        if (de.x.minRange != null && chartState._baseXDomain.length >= 2) {
          const d0 = chartState._baseXDomain[0] as unknown;
          const d1 = chartState._baseXDomain[1] as unknown;
          const isDate = d0 instanceof Date;
          const numD0 = isDate ? (d0 as Date).getTime() : (d0 as number);
          const numD1 = isDate ? (d1 as Date).getTime() : (d1 as number);
          const fullRange = Math.abs(numD1 - numD0);
          if (fullRange > 0) {
            const maxScale = fullRange / de.x.minRange;
            scale = Math.min(scale, maxScale);
          }
        }
        translate = {
          ...translate,
          x: constrainAxis(translate.x, scale, chartState.width, chartState._baseXDomain, de.x),
        };
      }

      if (de.y && (transformAxis === 'y' || transformAxis === 'both') && chartState.height > 0) {
        if (de.y.minRange != null && chartState._baseYDomain.length >= 2) {
          const d0 = chartState._baseYDomain[0] as unknown;
          const d1 = chartState._baseYDomain[1] as unknown;
          const isDate = d0 instanceof Date;
          const numD0 = isDate ? (d0 as Date).getTime() : (d0 as number);
          const numD1 = isDate ? (d1 as Date).getTime() : (d1 as number);
          const fullRange = Math.abs(numD1 - numD0);
          if (fullRange > 0) {
            const maxScale = fullRange / de.y.minRange;
            scale = Math.min(scale, maxScale);
          }
        }
        translate = {
          ...translate,
          y: constrainAxis(translate.y, scale, chartState.height, chartState._baseYDomain, de.y),
        };
      }

      return { scale, translate };
    };
  });

  const isBandDomainTransform = $derived(
    transform?.mode === 'domain' &&
      (((transform.axis ?? 'both') !== 'y' && isScaleBand(chartState._xScaleProp)) ||
        ((transform.axis ?? 'both') !== 'x' && isScaleBand(chartState._yScaleProp)))
  );

  const resolvedScaleExtent = $derived.by(() => {
    if (transform?.mode === 'projection' && transform?.scaleExtent && initialTransform) {
      const baseScale = initialTransform.scale;
      return [transform.scaleExtent[0] * baseScale, transform.scaleExtent[1] * baseScale] as [
        number,
        number,
      ];
    }
    if (!isBandDomainTransform) return transform?.scaleExtent;
    const userExtent = transform?.scaleExtent;
    return [Math.max(1, userExtent?.[0] ?? 1), userExtent?.[1] ?? Infinity] as [number, number];
  });

  const resolvedTranslateExtent = $derived.by(() => {
    if (transform?.mode === 'projection' && transform?.translateExtent) {
      if (resolvedApply.rotation) {
        return transform.translateExtent;
      }
      return undefined;
    }
    return transform?.translateExtent;
  });

  const projectionTranslateConstrain = $derived.by(() => {
    if (
      transform?.mode !== 'projection' ||
      !transform?.translateExtent ||
      !initialTransform ||
      resolvedApply.rotation
    ) {
      return undefined;
    }

    const baseScale = initialTransform.scale;
    const baseTranslate = initialTransform.translate;
    const [[x0, y0], [x1, y1]] = transform.translateExtent;

    return (t: { scale: number; translate: { x: number; y: number } }) => {
      let { scale, translate } = t;
      const k = scale / baseScale;

      translate = {
        x: Math.max(baseTranslate.x + x0 * k, Math.min(baseTranslate.x + x1 * k, translate.x)),
        y: Math.max(baseTranslate.y + y0 * k, Math.min(baseTranslate.y + y1 * k, translate.y)),
      };

      return { scale, translate };
    };
  });

  const bandScaleConstrain = $derived.by(() => {
    if (!isBandDomainTransform) return undefined;
    const xIsBand = (transform!.axis ?? 'both') !== 'y' && isScaleBand(chartState._xScaleProp);
    const yIsBand = (transform!.axis ?? 'both') !== 'x' && isScaleBand(chartState._yScaleProp);

    return (t: { scale: number; translate: { x: number; y: number } }) => {
      let { scale, translate } = t;
      let tx = translate.x;
      let ty = translate.y;
      if (xIsBand) {
        tx = Math.max(chartState.width * (1 - scale), Math.min(0, tx));
      }
      if (yIsBand) {
        ty = Math.max(chartState.height * (1 - scale), Math.min(0, ty));
      }
      return { scale, translate: { x: tx, y: ty } };
    };
  });

  const composedConstrain = $derived.by(() => {
    const userConstrain = transform?.constrain;
    const constrains = [
      bandScaleConstrain,
      domainExtentConstrain,
      projectionTranslateConstrain,
      userConstrain,
    ].filter(Boolean) as Array<
      (t: { scale: number; translate: { x: number; y: number } }) => {
        scale: number;
        translate: { x: number; y: number };
      }
    >;
    if (constrains.length === 0) return undefined;
    if (constrains.length === 1) return constrains[0];
    return (t: { scale: number; translate: { x: number; y: number } }) => {
      return constrains.reduce((acc, fn) => fn(acc), t);
    };
  });

  const enhancedBrushProps = $derived.by(() => {
    if (!brush) return { disabled: true };
    const userProps = typeof brush === 'object' ? brush : {};

    const userOnBrushEnd = userProps.onBrushEnd;
    const zoomOnBrush = 'zoomOnBrush' in userProps ? userProps.zoomOnBrush : false;
    const needsEnhancement = transform?.mode === 'domain' || zoomOnBrush;
    if (!needsEnhancement) return userProps;

    return {
      ...userProps,
      onBrushEnd: (e: { brush: BrushState }) => {
        if (e.brush.active) {
          if (transform?.mode === 'domain') {
            chartState.zoomToBrush(e.brush, userProps.axis ?? 'x');
          } else if (zoomOnBrush) {
            const axis = userProps.axis ?? 'x';
            if (axis === 'x' || axis === 'both') {
              brushXDomain = expandBandBrushDomain(e.brush.x, chartState._baseXDomain);
            }
            if (axis === 'y' || axis === 'both') {
              brushYDomain = expandBandBrushDomain(e.brush.y, chartState._baseYDomain);
            }
          }
          userOnBrushEnd?.(e);
          e.brush.reset();
        } else {
          if (transform?.mode === 'domain') {
            chartState.transform.reset();
          } else if (zoomOnBrush) {
            brushXDomain = undefined;
            brushYDomain = undefined;
          }
          userOnBrushEnd?.(e);
        }
      },
    };
  });
</script>

{#if ssr === true || typeof window !== 'undefined'}
  <div
    bind:this={ref}
    style:position
    style:top={position === 'absolute' ? 0 : null}
    style:right={position === 'absolute' ? 0 : null}
    style:bottom={position === 'absolute' ? 0 : null}
    style:left={position === 'absolute' ? 0 : null}
    style:pointer-events={pointerEvents === false ? 'none' : null}
    style:overflow={clip ? 'hidden' : null}
    style:width={width ? `${width}px` : '100%'}
    style:height={height ? `${height}px` : '100%'}
    bind:clientWidth={chartState._containerWidth}
    bind:clientHeight={chartState._containerHeight}
    class={['lc-root-container', className]}
    {...restProps}
  >
    {#key chartState.isMounted}
      {#if transform}
        <!-- Lazy-load TransformContext only when transform is enabled -->
        {@const {
          domainExtent: _de,
          constrain: _uc,
          apply: _apply,
          scaleExtent: _se,
          translateExtent: _te,
          ...transformProps
        } = transform}
        {#await import('../TransformContext.svelte')}
          {@render inner()}
        {:then { default: TransformContext }}
          <!-- svelte-ignore ownership_invalid_binding -->
          <TransformContext
            bind:state={chartState.transformState}
            mode={transform.mode ?? 'none'}
            initialTranslate={resolvedApply.translate ? initialTransform?.translate : undefined}
            initialScale={resolvedApply.scale ? initialTransform?.scale : undefined}
            {processTranslate}
            {...transformProps}
            scaleExtent={resolvedScaleExtent}
            translateExtent={resolvedTranslateExtent}
            constrain={composedConstrain}
            disablePointer={brush === true ||
              (typeof brush === 'object' && !brush.disabled) ||
              transform.disablePointer}
            {ondragstart}
            {onTransform}
            {ondragend}
          >
            {@render inner()}
          </TransformContext>
        {/await}
      {:else}
        {@render inner()}
      {/if}
    {/key}
  </div>
{/if}

{#snippet body()}
  {#if ChartChildren}
    <ChartChildren {children} {tooltipContext} {...restProps} />
  {:else}
    {@render children?.({ context: chartState })}
  {/if}
{/snippet}

{#snippet inner()}
  {#if brush}
    {#await import('../BrushContext.svelte')}
      <!-- svelte-ignore ownership_invalid_binding -->
      <TooltipContext
        onclick={onTooltipClick}
        {...getObjectOrNull(tooltipContext)}
        bind:state={chartState.tooltipState}
      >
        {@render body()}
      </TooltipContext>
    {:then { default: BrushContext }}
      <!-- svelte-ignore ownership_invalid_binding -->
      <BrushContext {...enhancedBrushProps} bind:state={chartState.brushState}>
        <!-- svelte-ignore ownership_invalid_binding -->
        <TooltipContext
          onclick={onTooltipClick}
          {...getObjectOrNull(tooltipContext)}
          bind:state={chartState.tooltipState}
        >
          {@render body()}
        </TooltipContext>
      </BrushContext>
    {/await}
  {:else}
    <!-- svelte-ignore ownership_invalid_binding -->
    <TooltipContext
      onclick={onTooltipClick}
      {...getObjectOrNull(tooltipContext)}
      bind:state={chartState.tooltipState}
    >
      {@render body()}
    </TooltipContext>
  {/if}
{/snippet}

<style>
  .lc-root-container,
  .lc-root-container :global(*) {
    box-sizing: border-box;
  }
</style>
