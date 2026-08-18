<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import { asAny, type Without } from '$lib/utils/types.js';
  import type { TooltipState as TooltipStateType } from '$lib/states/tooltip.svelte.js';
  import type { Accessor } from '$lib/utils/common.js';

  export type TooltipMode =
    | 'bisect-x' // requires values to be sorted
    | 'bisect-y' // requires values to be sorted
    | 'band'
    | 'bisect-band' // requires values to be sorted
    | 'bounds'
    | 'voronoi'
    | 'quadtree'
    | 'quadtree-x' // ignores y values (constant 0)
    | 'quadtree-y' // ignores x values (constant 0)
    | 'manual';

  type TooltipContextPropsWithoutHTML<T = any> = {
    /**
     * The tooltip interaction mode
     * @default 'manual'
     */
    mode?: TooltipMode;

    /**
     * Method to find tooltip data
     * @default 'closest'
     */
    findTooltipData?: 'closest' | 'left' | 'right';

    /**
     * Similar to d3-selection's raise, re-insert the e.target as the last child of its parent, so
     * to be the top-most element
     * @default false
     */
    raiseTarget?: boolean;

    /**
     * Lock tooltip (keep open, do not update on mouse movement). Allows for clicking on tooltip
     * @default false
     */
    locked?: boolean;

    /**
     * Controls the touch event behavior on the tooltip container.
     * By default uses `pan-y` to allow verticle scrolling but horizontal scrubbing.
     * Use `none` to disable all touch events (useful for improved transform/geo charts interactions)
     * @default 'pan-y'
     */
    touchEvents?: 'none' | 'pan-x' | 'pan-y' | 'auto';

    /**
     * quadtree search or voronoi clip radius
     * @default Infinity
     */
    radius?: number;

    /**
     * Override the `x` accessor used for quadtree/voronoi hit detection.
     * Useful when the chart's `x` accessor returns an array of values and you
     * want hit detection at a specific endpoint.
     *
     * Accepts a string property name (e.g. `'POP_2015'`) or a function.
     */
    x?: Accessor;

    /**
     * Override the `y` accessor used for quadtree/voronoi hit detection.
     * See `x` above.
     */
    y?: Accessor;

    /**
     * Enable debug view (show hit targets, etc)
     * @default false
     */
    debug?: boolean;

    /**
     * Click handler for the tooltip
     * @default () => {}
     */
    onclick?: (e: MouseEvent, { data }: { data: any }) => any;

    /**
     * Exposed to allow binding in Chart
     * @default { x: 0, y: 0, data: null, show: showTooltip, hide: hideTooltip, mode }
     */
    state?: TooltipStateType<T>;

    /**
     * Delay in ms before hiding tooltip
     * @default 0
     */
    hideDelay?: number;

    /**
     * A reference to the tooltip container element.
     *
     * @bindable
     */
    ref?: HTMLElement;

    children?: Snippet<[{ state: TooltipStateType<T> }]>;
  };

  export type TooltipContextProps<T = any> = TooltipContextPropsWithoutHTML<T> &
    Without<HTMLAttributes<HTMLElement>, TooltipContextPropsWithoutHTML<T>>;
</script>

<script lang="ts" generics="TData = any">
  import type { Snippet } from 'svelte';
  import { max, min } from 'd3-array';
  import type { Facet } from '$lib/states/facet.svelte.js';
  // d3-quadtree (used only for quadtree* tooltip modes) is dynamically
  // imported inside the $effect below so non-quadtree users don't pay for it.
  import type { Quadtree } from 'd3-quadtree';
  import { sortFunc, localPoint } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import Svg from './../layers/Svg.svelte';
  import ChartClipPath from '../ChartClipPath/ChartClipPath.svelte';
  // Voronoi (used only when mode === 'voronoi') and Arc (used only for radial
  // bounds/band mode) are dynamically imported inline in the markup via
  // `{#await import(...)}` so non-voronoi/non-radial tooltip users don't pay
  // for them. Voronoi alone pulls in d3-geo-voronoi + d3-geo.

  import { isScaleBand, isScaleTime, scaleInvert } from '$lib/utils/scales.svelte.js';
  import { cartesianToPolar } from '$lib/utils/math.js';
  import { quadtreeRects } from '$lib/utils/quadtree.js';
  import { raise } from '$lib/utils/chart.js';
  import { TooltipState, type TooltipShowOptions } from '$lib/states/tooltip.svelte.js';
  import { dataCoords, findDatumByValue } from '$lib/utils/tooltip.js';
  import { accessor, findRelatedData } from '$lib/utils/common.js';
  import { getSettings } from '$lib/contexts/settings.js';

  const ctx = getChartContext<any>();
  const geo = getGeoContext();
  const settings = getSettings();

  let {
    ref: refProp = $bindable(),
    debug: debugProp,
    findTooltipData = 'closest',
    hideDelay = 0,
    locked = false,
    touchEvents = 'pan-y',
    mode = 'manual',
    onclick = () => {},
    radius = Infinity,
    raiseTarget = false,
    state: stateProp = $bindable() as TooltipStateType<TData>,
    x: xProp,
    y: yProp,
    children,
  }: TooltipContextProps<TData> = $props();

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const tooltipState = new TooltipState<TData>(mode, showTooltip, hideTooltip);
  stateProp = tooltipState;

  const debug = $derived(debugProp ?? settings.debug);

  /*
		TODO: Defaults to consider (if possible to detect scale type, which might not be possible)
		- scaleTime / scaleLinear: bisect
		- scaleTime / scaleLinear (multi/stack): bisect
		- scaleTime / scaleBand: bisect (or band)
		- scaleTime (multi) / scaleBand: bounds (or possible band if not overlapping)
		- scaleBand, scaleLinear: band (or bounds)
		- scaleBand, scaleLinear: band (or bounds) - multiple (overlapping) bars
		- scaleLinear, scaleLinear: voronoi (or quadtree)
	*/

  let hideTimeoutId: ReturnType<typeof setTimeout>;

  function resolveTooltipSeriesKey(series: any, seriesTooltipData: any) {
    if (
      mode === 'manual' &&
      ctx.series.isDefaultSeries &&
      series.key === 'default' &&
      series.data == null &&
      series.value != null &&
      seriesTooltipData != null
    ) {
      const dataKey = ctx.c?.(seriesTooltipData);
      if (typeof dataKey === 'string' || typeof dataKey === 'number') {
        return `${dataKey}`;
      }
    }

    return series.key;
  }

  /**
   * Guards shared by every `show*` entry point.  Returns `false` when the tooltip should not
   * update, and cancels a pending hide from a previous event loop otherwise.
   */
  function canShow() {
    if (isTransforming) {
      // Pointer gesture (drag/pinch) owns the pointer - do not show/update the tooltip
      hideTooltip();
      return false;
    }

    // Cancel hiding tooltip if from previous event loop
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
    }

    // Ignore while locked (keep current position / data)
    return !locked;
  }

  /**
   * Whether a container-relative point falls outside the plot area (ex. within the chart's
   * padding).  Prevents showing the tooltip when interacting with axes, legends, etc.  For
   * voronoi/quadtree modes this is handled by the lookup finding no point, but for bisect modes
   * it has to be checked manually.
   */
  function isOutsidePlotArea(point: { x: number; y: number }) {
    return (
      ref !== undefined &&
      (point.x < ref.offsetLeft ||
        point.x > ref.offsetLeft + ref.offsetWidth ||
        point.y < ref.offsetTop ||
        point.y > ref.offsetTop + ref.offsetHeight)
    );
  }

  /**
   * The rows a panel resolves its tooltip against.
   *
   * Only faceted charts scope to a panel — `flatData` also covers marks carrying their own data,
   * which a facet partition (defined over the chart's `data`) has no rows for.
   */
  function panelData(panel: Facet | undefined) {
    return ctx.facet.enabled && panel ? panel.data : ctx.flatData;
  }

  /**
   * A container-relative point resolved into the panel it lands in, with the point restated in
   * that panel's coordinates.
   *
   * Unfaceted charts land in the single full-size panel, so callers need no branch. Returns
   * `undefined` in the gap between panels, where there's nothing to resolve against.
   */
  function resolvePanel(point: { x: number; y: number }) {
    const x = point.x - ctx.padding.left;
    const y = point.y - ctx.padding.top;
    const panel = ctx.facet.panelAt(x, y);
    return panel ? { panel, x: x - panel.x, y: y - panel.y } : undefined;
  }

  /** Find the data point at a container-relative pixel coordinate, using the configured `mode` */
  function findDataAtPoint(point: { x: number; y: number }) {
    const hit = resolvePanel(point);
    if (!hit) return undefined;

    const { panel } = hit;
    // Scales are shared across panels, so inverting is panel-relative
    const dataCtx = {
      flatData: panelData(panel),
      x: ctx.x,
      y: ctx.y,
      xScale: ctx.xScale,
      yScale: ctx.yScale,
    };

    switch (mode) {
      case 'bisect-x': {
        let xValueAtPoint: any;
        if (ctx.radial) {
          // Assume radial is always centered
          const { radians } = cartesianToPolar(hit.x - ctx.width / 2, hit.y - ctx.height / 2);
          xValueAtPoint = scaleInvert(ctx.xScale, radians);
        } else {
          xValueAtPoint = scaleInvert(ctx.xScale, hit.x);
        }

        return findDatumByValue(dataCtx, { x: xValueAtPoint }, { mode, findTooltipData });
      }

      case 'bisect-y': {
        // `y` value at pointer coordinate
        const yValueAtPoint = scaleInvert(ctx.yScale, hit.y);

        return findDatumByValue(dataCtx, { y: yValueAtPoint }, { mode, findTooltipData });
      }

      case 'bisect-band': {
        // `x` and `y` values at pointer coordinate
        const xValueAtPoint = scaleInvert(ctx.xScale, hit.x);
        const yValueAtPoint = scaleInvert(ctx.yScale, hit.y);

        return findDatumByValue(dataCtx, { x: xValueAtPoint, y: yValueAtPoint }, { mode, findTooltipData }); // prettier-ignore
      }

      case 'quadtree-x':
      case 'quadtree-y':
      case 'quadtree': {
        let qx = hit.x;
        let qy = hit.y;

        // Apply inverse transform to convert screen coordinates to canvas coordinates
        if (ctx.transform.mode === 'canvas') {
          qx = (qx - ctx.transform.translate.x) / ctx.transform.scale;
          qy = (qy - ctx.transform.translate.y) / ctx.transform.scale;
        }

        // One tree per panel — panels share the scales, so their points would otherwise
        // occupy the same coordinates and the nearest could come from any of them
        return quadtrees.get(panel.key)?.find(qx, qy, radius);
      }

      default:
        return undefined;
    }
  }

  /** Resolve the per-series values shown in the tooltip for a data point */
  function resolveSeries(tooltipData: any) {
    // For quadtree/voronoi modes, the tooltip finds a single specific point (by x+y proximity),
    // so only the owning series should be matched. For bisect and quadtree-x/y modes,
    // the tooltip finds by a single axis position and all series at that position should show values.
    const isSinglePointMode = mode === 'quadtree' || mode === 'voronoi';

    return ctx.series.series.map((s) => {
      // Find related data point for this series (if series has its own data)
      const seriesTooltipData = s.data
        ? isSinglePointMode
          ? tooltipData?.seriesKey != null
            ? s.key === tooltipData.seriesKey
              ? tooltipData
              : undefined
            : s.data.includes(tooltipData)
              ? tooltipData
              : undefined
          : findRelatedData(s.data, tooltipData, ctx.x)
        : tooltipData;

      const valueAcc = accessor(
        s.value ?? (s.data ? (ctx.props.y ?? ctx.props.x ?? asAny(ctx.y) ?? asAny(ctx.x)) : s.key)
      );

      // Extract value from the data
      const value = seriesTooltipData ? valueAcc(seriesTooltipData) : undefined;

      const seriesKey = resolveTooltipSeriesKey(s, seriesTooltipData);

      // When user explicitly provides cScale, prefer scale-derived color (e.g. gradient encoding).
      // Otherwise prefer series-defined color (e.g. BarChart with explicit series colors).
      const scaleColor = ctx.cScale?.(ctx.c(tooltipData));
      const color = ctx.props.cScale ? (scaleColor ?? s.color) : (s.color ?? scaleColor);

      return {
        key: seriesKey,
        label: s.label ?? (seriesKey !== 'default' ? seriesKey : 'value'),
        value: value,
        color,
        visible:
          seriesKey === s.key
            ? ctx.series.isVisible(s.key)
            : ctx.series.selectedKeys.isEmpty() || ctx.series.selectedKeys.isSelected(seriesKey),
        config: s,
      };
    });
  }

  /** Commit a resolved data point to the tooltip state, or hide if there is none */
  function applyTooltip(
    point: { x: number; y: number },
    tooltipData: any,
    options: { source?: string | symbol | null; suppressed?: boolean } = {}
  ) {
    if (tooltipData == null) {
      // Hide tooltip if unable to locate
      hideTooltip();
      return;
    }

    const series = resolveSeries(tooltipData);

    tooltipState.x = point.x;
    tooltipState.y = point.y;
    tooltipState.data = tooltipData;
    // Unset `source` means this chart's own pointer drove it
    tooltipState.source = options.source ?? ctx.id;
    tooltipState.suppressed = options.suppressed ?? false;
    tooltipState.onChange?.();
    // Reverse series order for stacked charts to match visual stack order (bottom to top)
    tooltipState.series = ctx.series.isStacked ? [...series].reverse() : series;
  }

  /** Distinguish the `show(e, data)` overload from `show({ point, value, data })` */
  function isPointerLike(value: unknown): value is PointerEvent | MouseEvent | TouchEvent {
    // Duck-typed rather than `instanceof Event` so events from another realm (ex. an iframe)
    // are still recognized
    return typeof (value as any)?.preventDefault === 'function';
  }

  function showFromEvent(e: PointerEvent | MouseEvent | TouchEvent, tooltipData?: any) {
    const containerNode = (e.target as Element).closest('.lc-root-container')!;
    const point = localPoint(e, containerNode);

    if (
      tooltipData == null && // mode !== 'manual' but support annotations
      isOutsidePlotArea(point)
    ) {
      // Ignore if within padding of chart
      hideTooltip();
      return;
    }

    // If tooltipData not provided already (voronoi, etc), attempt to find it
    tooltipData ??= findDataAtPoint(point);

    if (tooltipData && raiseTarget) {
      raise(e.target as Element);
    }

    applyTooltip(point, tooltipData);
  }

  function showFromOptions({ point, value, data, source, suppressed }: TooltipShowOptions<TData>) {
    // Resolve *what* to show — an explicit data point, the nearest point to a domain value, or
    // whatever is found at `point` using the configured `mode`
    let tooltipData: any = data ?? (value ? findDatumByValue(ctx, value, { mode, findTooltipData }) : undefined); // prettier-ignore

    if (tooltipData == null && point) {
      if (isOutsidePlotArea(point)) {
        hideTooltip();
        return;
      }
      tooltipData = findDataAtPoint(point);
    }

    if (tooltipData == null) {
      hideTooltip();
      return;
    }

    // Resolve *where* to show it — the given point, else the data point's own position
    applyTooltip(point ?? dataCoords(ctx, tooltipData), tooltipData, { source, suppressed });
  }

  function showTooltip(
    optionsOrEvent: TooltipShowOptions<TData> | PointerEvent | MouseEvent | TouchEvent,
    eventData?: any
  ) {
    if (!canShow()) return;

    if (isPointerLike(optionsOrEvent)) {
      showFromEvent(optionsOrEvent, eventData);
    } else {
      showFromOptions(optionsOrEvent ?? {});
    }
  }

  function hideTooltip() {
    if (locked) {
      // Ignore (keep open)
      return;
    }

    tooltipState.isHoveringTooltipArea = false;

    // Wait an event loop tick in case `showTooltip` is called immediately on another element,
    // to allow tweening (ex. moving between bands/bars)
    // Additional hideDelay can be configured to extend this delay further
    hideTimeoutId = setTimeout(() => {
      if (!tooltipState.isHoveringTooltipArea && !tooltipState.isHoveringTooltipContent) {
        tooltipState.data = null;
        // This chart cleared its own tooltip — attributing the clear to it is what lets a group
        // member publish the clear (and take ownership back) on the next interaction
        tooltipState.source = ctx.id;
        tooltipState.suppressed = false;
        tooltipState.onChange?.();
      }
    }, hideDelay);
  }

  const xAccessorOverride = $derived(xProp != null ? accessor(xProp) : undefined);
  const yAccessorOverride = $derived(yProp != null ? accessor(yProp) : undefined);

  let quadtrees = $state<Map<string, Quadtree<[number, number]>>>(new Map());

  $effect(() => {
    // Touch the dependencies the quadtree is built from so the effect re-runs
    // on changes (mode, accessors, scales, data, projection).
    if (!['quadtree', 'quadtree-x', 'quadtree-y'].includes(mode)) {
      quadtrees = new Map();
      return;
    }

    const m = mode;
    const xAcc = xAccessorOverride;
    const yAcc = yAccessorOverride;
    const xScale = ctx.xScale;
    const yScale = ctx.yScale;
    const xGet = ctx.xGet;
    const yGet = ctx.yGet;
    const xAccCtx = ctx.x;
    const yAccCtx = ctx.y;
    const projection = geo.projection;
    const panels = ctx.facet.panels.map((panel) => [panel.key, panelData(panel)] as const);

    let cancelled = false;
    import('d3-quadtree').then(({ quadtree: d3Quadtree }) => {
      if (cancelled) return;
      const build = (flatData: any[]) =>
        d3Quadtree<[number, number]>()
          .x((d) => {
            if (m === 'quadtree-y') return 0;
            if (xAcc) {
              const scaled = xScale(xAcc(d));
              return typeof scaled === 'number' ? scaled : 0;
            }
            if (projection) {
              const lat = xAccCtx(d);
              const long = yAccCtx(d);
              const geoValue = projection([lat, long]) ?? [0, 0];
              return geoValue[0];
            }
            const value = xGet(d);
            if (Array.isArray(value)) {
              // `x` accessor with multiple properties (ex. `x={['start', 'end']})`).
              // Default to the max (typically the "target"/"end" endpoint); override
              // via the `x` prop for explicit control.
              return max(value);
            }
            return value;
          })
          .y((d) => {
            if (m === 'quadtree-x') return 0;
            if (yAcc) {
              const scaled = yScale(yAcc(d));
              return typeof scaled === 'number' ? scaled : 0;
            }
            if (projection) {
              const lat = xAccCtx(d);
              const long = yAccCtx(d);
              const geoValue = projection([lat, long]) ?? [0, 0];
              return geoValue[1];
            }
            const value = yGet(d);
            if (Array.isArray(value)) {
              // `y` accessor with multiple properties — default to max endpoint.
              return max(value);
            }
            return value;
          })
          .addAll(flatData as [number, number][]);

      quadtrees = new Map(panels.map(([key, data]) => [key, build(data)]));
    });
    return () => {
      cancelled = true;
    };
  });

  /**
   * Hit rectangles for `bounds` / `band` modes, one per row.
   *
   * Takes its rows rather than reading `flatData`, because these render inside the layer — and so
   * once per panel of a faceted chart, each covering only that panel's rows.
   */
  function rectsFor(
    rows: any[]
  ): Array<{ x: number; y: number; width: number; height: number; data: any }> {
    // A band scale inside a facet panel groups the same way `x1` / `y1` do inside a band, so the
    // panel is what the pointer resolves to — one rect over the whole panel rather than one per
    // bar.  Any of its rows names the panel; `DefaultTooltip` reads the rest back from it.
    //
    // Gated on `facetBand` rather than on faceting alone: where the panel *isn't* the band, the
    // highlight and the tooltip stay per row, and a panel-wide rect would resolve every hover in
    // the panel to its first row.
    if (ctx.facetBand && !ctx.radial) {
      if (rows.length === 0) return [];
      return [
        {
          x: min(ctx.xRange),
          y: min(ctx.yRange),
          width: max(ctx.xRange) - min(ctx.xRange),
          height: max(ctx.yRange) - min(ctx.yRange),
          data: rows[0],
        },
      ];
    }

    if (mode === 'bounds' || mode === 'band') {
      return rows
        .map((d) => {
          const xValue = ctx.xGet(d);
          const yValue = ctx.yGet(d);

          const x = Array.isArray(xValue) ? xValue[0] : xValue;
          const y = Array.isArray(yValue) ? yValue[0] : yValue;

          const xOffset = isScaleBand(ctx.xScale)
            ? (ctx.xScale.padding() * ctx.xScale.step()) / 2
            : 0;
          const yOffset = isScaleBand(ctx.yScale)
            ? (ctx.yScale.padding() * ctx.yScale.step()) / 2
            : 0;

          const fullWidth = max(ctx.xRange) - min(ctx.xRange);
          const fullHeight = max(ctx.yRange) - min(ctx.yRange);

          if (mode === 'band') {
            if (isScaleBand(ctx.xScale)) {
              // full band width/height regardless of value
              return {
                x: x - xOffset,
                y: isScaleBand(ctx.yScale) ? y - yOffset : min(ctx.yRange),
                width: ctx.xScale.step(),
                height: isScaleBand(ctx.yScale) ? ctx.yScale.step() : fullHeight,
                data: d,
              };
            } else if (isScaleBand(ctx.yScale)) {
              return {
                x: isScaleBand(ctx.xScale) ? x - xOffset : min(ctx.xRange),
                y: y - yOffset,
                width: isScaleBand(ctx.xScale) ? ctx.xScale.step() : fullWidth,
                height: ctx.yScale.step(),
                data: d,
              };
            } else if (ctx.xInterval) {
              // x-axis time scale with interval
              const xVal = ctx.x(d);
              const start = ctx.xInterval.floor(xVal);
              const end = ctx.xInterval.offset(start);
              const xStart = ctx.xScale(start);
              const xEnd = ctx.xScale(end);

              return {
                x: Math.min(xStart, xEnd),
                y: isScaleBand(ctx.yScale) ? y - yOffset : min(ctx.yRange),
                width: Math.abs(xEnd - xStart),
                height: isScaleBand(ctx.yScale) ? ctx.yScale.step() : fullHeight,
                data: d,
              };
            } else if (ctx.yInterval) {
              // y-axis time scale with interval
              const yVal = ctx.y(d);
              const start = ctx.yInterval.floor(yVal);
              const end = ctx.yInterval.offset(start);
              const yStart = ctx.yScale(start);
              const yEnd = ctx.yScale(end);

              return {
                x: isScaleBand(ctx.xScale) ? x - xOffset : min(ctx.xRange),
                y: Math.min(yStart, yEnd),
                width: isScaleBand(ctx.xScale) ? ctx.xScale.step() : fullWidth,
                height: Math.abs(yEnd - yStart),
                data: d,
              };
            } else if (Array.isArray(xValue)) {
              return {
                x: Math.min(xValue[0], xValue[1]) - xOffset,
                y: Array.isArray(yValue)
                  ? Math.min(yValue[0], yValue[1]) - yOffset
                  : min(ctx.yRange),
                width: Math.abs(xValue[1] - xValue[0]),
                height: Array.isArray(yValue) ? Math.abs(yValue[1] - yValue[0]) : fullHeight,
                data: d,
              };
            } else if (Array.isArray(yValue)) {
              return {
                x: min(ctx.xRange),
                y: Math.min(yValue[0], yValue[1]) - yOffset,
                width: fullWidth,
                height: Math.abs(yValue[1] - yValue[0]),
                data: d,
              };
            } else if (isScaleTime(ctx.xScale)) {
              // Find width to next data point
              const index = rows.findIndex((d2) => Number(ctx.x(d2)) === Number(ctx.x(d)));
              const isLastPoint = index + 1 === rows.length;
              const nextDataPoint = isLastPoint ? max(ctx.xDomain) : ctx.x(rows[index + 1]);

              return {
                x: x - xOffset,
                y: isScaleBand(ctx.yScale) ? y - yOffset : min(ctx.yRange),
                width: (ctx.xScale(nextDataPoint) ?? 0) - (xValue ?? 0),
                height: isScaleBand(ctx.yScale) ? ctx.yScale.step() : fullHeight,
                data: d,
              };
            } else if (isScaleTime(ctx.yScale)) {
              // Find height to next data point
              const index = rows.findIndex((d2) => Number(ctx.y(d2)) === Number(ctx.y(d)));
              const isLastPoint = index + 1 === rows.length;
              const nextDataPoint = isLastPoint ? max(ctx.yDomain) : ctx.y(rows[index + 1]);

              return {
                x: isScaleBand(ctx.xScale) ? x - xOffset : min(ctx.xRange),
                y: y - yOffset,
                width: isScaleBand(ctx.xScale) ? ctx.xScale.step() : fullWidth,
                height: (ctx.yScale(nextDataPoint) ?? 0) - (yValue ?? 0),
                data: d,
              };
            } else {
              console.warn(
                '[layerchart] TooltipContext band mode requires at least one scale to be band or time.'
              );
              return undefined;
            }
          } else if (mode === 'bounds') {
            return {
              x: isScaleBand(ctx.xScale) || Array.isArray(xValue) ? x - xOffset : min(ctx.xRange),
              // y: isScaleBand($yScale) || Array.isArray(yValue) ? y - yOffset : min($yRange),
              y: y - yOffset,

              width: Array.isArray(xValue)
                ? xValue[1] - xValue[0]
                : isScaleBand(ctx.xScale)
                  ? ctx.xScale.step()
                  : min(ctx.xRange) + x,
              height: Array.isArray(yValue)
                ? yValue[1] - yValue[0]
                : isScaleBand(ctx.yScale)
                  ? ctx.yScale.step()
                  : max(ctx.yRange) - y,
              data: d,
            };
          }
        })
        .filter((x) => x !== undefined) // make typescript happy
        .sort(sortFunc('x'));
    }
    return [];
  }

  const triggerPointerEvents = $derived(
    ['bisect-x', 'bisect-y', 'bisect-band', 'quadtree', 'quadtree-x', 'quadtree-y'].includes(mode)
  );

  /**
   * Whether a transform pointer gesture (drag or pinch) is in progress.  Pointer capture normally
   * retargets events to `TransformContext` mid-gesture, but events which arrive before capture is
   * established (ex. each new pointer of a pinch) would otherwise show/update the tooltip.
   */
  const isTransforming = $derived(
    ctx.transformState?.dragging === true || ctx.transformState?.pinching === true
  );

  $effect(() => {
    // Hide a tooltip shown before the gesture started (ex. first finger of a pinch)
    if (isTransforming) {
      hideTooltip();
    }
  });

  function onPointerEnter(e: PointerEvent | MouseEvent | TouchEvent) {
    if (isTransforming) return;

    tooltipState.isHoveringTooltipArea = true;
    if (triggerPointerEvents) {
      showTooltip(e);
    }
  }

  function onPointerMove(e: PointerEvent | MouseEvent | TouchEvent) {
    if (isTransforming) return;

    if (triggerPointerEvents) {
      showTooltip(e);
    }
  }

  function onPointerLeave(e: PointerEvent | MouseEvent | TouchEvent) {
    tooltipState.isHoveringTooltipArea = false;
    hideTooltip();
  }

  function onPointerCancel(e: PointerEvent | MouseEvent | TouchEvent) {
    // Fired when a touch is stolen for scrolling (ex. `pan-y` vertical scroll on mobile).
    // The browser dispatches `pointercancel` instead of `pointerleave`/`pointerup`, so
    // hide the tooltip here to avoid it persisting during/after the scroll.
    tooltipState.isHoveringTooltipArea = false;
    hideTooltip();
  }
</script>

<!--
  Sized to the whole plot area rather than `ctx.width` / `ctx.height`, which are one panel's box
  on a faceted chart — the pointer has to reach every panel.
-->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  style:top="{ctx.padding.top}px"
  style:left="{ctx.padding.left}px"
  style:width="{ctx.box.width}px"
  style:height="{ctx.box.height}px"
  style:--touch-action={touchEvents}
  class="lc-tooltip-context"
  class:debug={debug && triggerPointerEvents}
  onpointerenter={onPointerEnter}
  onpointermove={onPointerMove}
  onpointerleave={onPointerLeave}
  onpointercancel={onPointerCancel}
  onclick={(e) => {
    // Ignore clicks without data (triggered from Legend clicks, for example)
    if (triggerPointerEvents && tooltipState.data != null) {
      onclick(e, { data: tooltipState.data });
    }
  }}
  onkeydown={() => {}}
  bind:this={ref}
>
  <!-- Rendering slot within TooltipContext to allow pointer events to bubble up (ex. Brush) -->
  <div
    class="lc-tooltip-context-container"
    style:top="-{ctx.padding.top ?? 0}px"
    style:left="-{ctx.padding.left ?? 0}px"
    style:width="{ctx.containerWidth}px"
    style:height="{ctx.containerHeight}px"
  >
    {@render children?.({ state: tooltipState })}

    {#if mode === 'voronoi'}
      {#await import('../Voronoi/Voronoi.svelte') then { default: Voronoi }}
        <Svg>
          {#snippet children()}
            <!-- `Voronoi` resolves its own panel's rows, so there's nothing to narrow here -->
            <Voronoi
              x={xProp}
              y={yProp}
              r={radius}
              onpointerenter={(e, { data }) => {
                showTooltip(e, data);
              }}
              onpointermove={(e, { data }) => {
                showTooltip(e, data);
              }}
              onpointerleave={() => hideTooltip()}
              onpointerdown={(e) => {
                // @ts-expect-error
                if (e.target?.hasPointerCapture(e.pointerId)) {
                  // @ts-expect-error
                  e.target.releasePointerCapture(e.pointerId);
                }
              }}
              onclick={(e, { data }) => {
                onclick(e, { data });
              }}
              classes={{ path: cls('lc-tooltip-voronoi-path', debug && 'debug') }}
            />
          {/snippet}
        </Svg>
      {/await}
    {:else if mode === 'bounds' || mode === 'band'}
      <Svg center={ctx.radial}>
        {#snippet children({ facet })}
          <g class="lc-tooltip-rects-g">
            {#each rectsFor(panelData(facet)) as rect}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              {#if ctx.radial}
                {#await import('../Arc/Arc.svelte') then { default: Arc }}
                  <Arc
                    innerRadius={rect.y}
                    outerRadius={rect.y + rect.height}
                    startAngle={rect.x}
                    endAngle={rect.x + rect.width}
                    class={cls('lc-tooltip-rect', debug && 'debug')}
                    onpointerenter={(e) => showTooltip(e, rect?.data)}
                    onpointermove={(e) => showTooltip(e, rect?.data)}
                    onpointerleave={() => hideTooltip()}
                    onpointerdown={(e) => {
                      const target = e.target as Element;
                      if (target?.hasPointerCapture(e.pointerId)) {
                        target.releasePointerCapture(e.pointerId);
                      }
                    }}
                    onclick={(e) => {
                      onclick(e, { data: rect?.data });
                    }}
                  />
                {/await}
              {:else}
                <rect
                  x={rect?.x}
                  y={rect?.y}
                  width={rect?.width}
                  height={rect?.height}
                  class={cls('lc-tooltip-rect', debug && 'debug')}
                  onpointerenter={(e) => showTooltip(e, rect?.data)}
                  onpointermove={(e) => showTooltip(e, rect?.data)}
                  onpointerleave={() => hideTooltip()}
                  onpointerdown={(e) => {
                    const target = e.target as Element;
                    if (target?.hasPointerCapture(e.pointerId)) {
                      target.releasePointerCapture(e.pointerId);
                    }
                  }}
                  onclick={(e) => {
                    onclick(e, { data: rect?.data });
                  }}
                />
              {/if}
            {/each}
          </g>
        {/snippet}
      </Svg>
    {:else if ['quadtree', 'quadtree-x', 'quadtree-y'].includes(mode) && debug}
      <Svg pointerEvents={false}>
        <ChartClipPath>
          <g class="lc-tooltip-quadtree-g">
            {#each quadtrees.values() as tree}
              {#each quadtreeRects(tree, false) as rect}
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  class={cls('lc-tooltip-quadtree-rect', debug && 'debug')}
                />
              {/each}
            {/each}
          </g>
        </ChartClipPath>
      </Svg>
    {/if}
  </div>
</div>

<style>
  @layer components {
    :where(.lc-tooltip-context-container) {
      position: absolute;
    }

    :where(.lc-tooltip-context) {
      position: absolute;
      touch-action: var(--touch-action);

      &.debug {
        outline: 1px solid var(--color-danger);
        background-color: color-mix(in oklab, var(--color-danger) 10%, transparent);
      }
    }

    :global(:where(.lc-tooltip-voronoi-path)) {
      &.debug {
        stroke: var(--color-danger);
        fill: color-mix(in oklab, var(--color-danger) 10%, transparent);
      }
    }

    :where(.lc-tooltip-rect) {
      fill: transparent;

      &.debug {
        stroke: var(--color-danger);
        fill: color-mix(in oklab, var(--color-danger) 10%, transparent);
      }
    }

    :where(.lc-tooltip-quadtree-rect) {
      fill: transparent;

      &.debug {
        stroke: var(--color-danger);
        fill: color-mix(in oklab, var(--color-danger) 10%, transparent);
      }
    }
  }
</style>
