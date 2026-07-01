<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { VectorProps } from './Vector.shared.svelte.js';

  export type VectorBaseLayerComponents = {
    Path: Component<any>;
  };

  export type VectorBaseProps = VectorProps & VectorBaseLayerComponents;
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { createMotion, createDataMotionMap } from '$lib/utils/motion.svelte.js';
  import {
    hasAnyDataProp,
    resolveDataProp,
    extractRawDataValue,
    resolveGeoDataPair,
    resolveStyleProp,
    resolveColorProp,
  } from '$lib/utils/dataProp.js';
  import { chartDataArray } from '$lib/utils/common.js';
  import { cls } from '@layerstack/tailwind';
  import {
    vectorArrowPath,
    vectorArrowFilledPath,
    vectorSpikePath,
    transformVectorPath,
  } from '$lib/utils/path.js';

  let {
    Path,
    x = 0,
    initialX: initialXProp,
    y = 0,
    initialY: initialYProp,
    length: lengthProp = 12,
    initialLength: initialLengthProp,
    rotate: rotateProp = 0,
    shape = 'arrow',
    anchor,
    width,
    children,
    data: dataProp,
    key: keyFn = (_: any, i: number) => i,
    motion,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    class: className,
    ...restProps
  }: VectorBaseProps = $props();

  const isFilled = $derived(shape === 'spike' || shape === 'arrow-filled');
  const resolvedAnchor = $derived(anchor ?? (isFilled ? 'start' : 'middle'));

  const dataMode = $derived(hasAnyDataProp(x, y, lengthProp, rotateProp));

  const hasPerItemStyles = $derived(
    typeof fill === 'function' ||
      typeof stroke === 'function' ||
      typeof fillOpacity === 'function' ||
      typeof strokeWidth === 'function' ||
      typeof opacity === 'function' ||
      typeof className === 'function'
  );

  const chartCtx = getChartContext();
  const geo = getGeoContext();

  const resolvedData: any[] = $derived(
    dataMode ? dataProp ?? chartDataArray(chartCtx.data) : []
  );

  function resolveVector(d: any) {
    let resolvedX: number, resolvedY: number;
    if (geo.projection) {
      [resolvedX, resolvedY] = resolveGeoDataPair(x, y, d, geo.projection);
    } else {
      resolvedX = resolveDataProp(x, d, chartCtx.xScale, 0);
      resolvedY = resolveDataProp(y, d, chartCtx.yScale, 0);
    }
    return {
      x: resolvedX,
      y: resolvedY,
      length: resolveDataProp(
        lengthProp,
        d,
        chartCtx.rScale,
        typeof lengthProp === 'number' ? lengthProp : 12
      ),
      rotate:
        typeof rotateProp === 'number' ? rotateProp : extractRawDataValue(rotateProp, d) ?? 0,
    };
  }

  const dataMotionMap = createDataMotionMap(motion);

  if (dataMotionMap) {
    $effect(() => {
      if (!dataMode) return;
      const activeKeys = new Set<any>();
      for (let i = 0; i < resolvedData.length; i++) {
        const d = resolvedData[i];
        const key = keyFn(d, i);
        activeKeys.add(key);
        const resolved = resolveVector(d);
        untrack(() => dataMotionMap.update(key, resolved));
      }
      untrack(() => dataMotionMap.cleanup(activeKeys));
    });
  }

  const resolvedItems = $derived.by(() => {
    if (!dataMode) return [];
    return resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = resolveVector(d);
      const animated = dataMotionMap?.get(key);
      return {
        d,
        key,
        x: animated?.x ?? resolved.x,
        y: animated?.y ?? resolved.y,
        length: animated?.length ?? resolved.length,
        rotate: resolved.rotate,
      };
    });
  });

  function getAnchorOffset(len: number) {
    switch (resolvedAnchor) {
      case 'start':
        return 0;
      case 'end':
        return len;
      case 'middle':
      default:
        return len / 2;
    }
  }

  function getLocalPathData(len: number) {
    const w = width ?? len * 0.25;
    if (shape === 'spike') {
      return vectorSpikePath({ length: len, anchor: resolvedAnchor, width: w });
    }
    if (shape === 'arrow-filled') {
      return vectorArrowFilledPath({ length: len, anchor: resolvedAnchor, width: w });
    }
    return vectorArrowPath({ length: len, anchor: resolvedAnchor, width: w });
  }

  function getAbsolutePathData(itemX: number, itemY: number, len: number, rot: number) {
    return transformVectorPath(getLocalPathData(len), itemX, itemY, rot);
  }

  const combinedPathData = $derived.by(() => {
    if (dataMode) {
      return resolvedItems
        .map((item) => getAbsolutePathData(item.x, item.y, item.length, item.rotate))
        .join('');
    }
    return null;
  });

  const initialX = initialXProp ?? (typeof x === 'number' ? x : 0);
  const initialY = initialYProp ?? (typeof y === 'number' ? y : 0);
  const initialLength = initialLengthProp ?? (typeof lengthProp === 'number' ? lengthProp : 12);

  const motionX = createMotion(initialX, () => (typeof x === 'number' ? x : 0), motion);
  const motionY = createMotion(initialY, () => (typeof y === 'number' ? y : 0), motion);
  const motionLength = createMotion(
    initialLength,
    () => (typeof lengthProp === 'number' ? lengthProp : 12),
    motion
  );

  const pixelRotate = $derived(typeof rotateProp === 'number' ? rotateProp : 0);

  const pixelPathData = $derived(
    getAbsolutePathData(motionX.current, motionY.current, motionLength.current, pixelRotate)
  );
</script>

{#if children}
  {#if dataMode}
    {#each resolvedItems as item (item.key)}
      {@const offset = getAnchorOffset(item.length)}
      {@const resolvedClass = resolveStyleProp(className, item.d)}
      <g transform="translate({item.x},{item.y}) rotate({item.rotate})" class={resolvedClass}>
        <g transform="translate(0,{offset})">
          {@render children({ length: item.length, d: item.d })}
        </g>
      </g>
    {/each}
  {:else}
    {@const offset = getAnchorOffset(motionLength.current)}
    <g transform="translate({motionX.current},{motionY.current}) rotate({pixelRotate})">
      <g transform="translate(0,{offset})">
        {@render children({ length: motionLength.current })}
      </g>
    </g>
  {/if}
{:else if dataMode && hasPerItemStyles}
  {#each resolvedItems as item (item.key)}
    {@const resolvedFill = resolveColorProp(fill, item.d, chartCtx.cScale)}
    {@const resolvedStroke = resolveColorProp(stroke, item.d, chartCtx.cScale)}
    {@const resolvedFillOpacity = resolveStyleProp(fillOpacity, item.d)}
    {@const resolvedStrokeWidth = resolveStyleProp(strokeWidth, item.d)}
    {@const resolvedOpacity = resolveStyleProp(opacity, item.d)}
    {@const resolvedClass = resolveStyleProp(className, item.d)}
    <Path
      pathData={getAbsolutePathData(item.x, item.y, item.length, item.rotate)}
      fill={resolvedFill}
      fillOpacity={resolvedFillOpacity}
      stroke={resolvedStroke}
      strokeWidth={resolvedStrokeWidth}
      opacity={resolvedOpacity}
      class={cls('lc-vector', isFilled ? 'lc-vector-filled' : 'lc-vector-stroked', resolvedClass)}
    />
  {/each}
{:else}
  <Path
    pathData={dataMode ? combinedPathData : pixelPathData}
    fill={fill as string}
    fillOpacity={fillOpacity as number}
    stroke={stroke as string}
    strokeWidth={strokeWidth as number}
    opacity={opacity as number}
    class="lc-vector {isFilled ? 'lc-vector-filled' : 'lc-vector-stroked'} {typeof className ===
    'string'
      ? className
      : ''}"
  />
{/if}

<style>
  @layer base {
    :global(:where(.lc-vector)) {
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    :global(:where(.lc-layout-svg .lc-vector-stroked, svg.lc-vector-stroked):not([stroke])) {
      stroke: var(--color-surface-content, currentColor);
    }
    :global(:where(.lc-layout-svg .lc-vector-stroked, svg.lc-vector-stroked):not([fill])) {
      fill: none;
    }

    :global(:where(.lc-layout-svg .lc-vector-filled, svg.lc-vector-filled):not([fill])) {
      fill: var(--color-surface-content, currentColor);
    }
    :global(:where(.lc-layout-svg .lc-vector-filled, svg.lc-vector-filled):not([stroke])) {
      stroke: none;
    }
  }
</style>
