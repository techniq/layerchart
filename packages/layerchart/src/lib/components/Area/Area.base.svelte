<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { AreaProps } from './Area.shared.svelte.js';

  export type AreaBaseLayerComponents = {
    Path: Component<any>;
    Spline: Component<any>;
  };

  export type AreaBaseProps = AreaProps & AreaBaseLayerComponents;
</script>

<script lang="ts">
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { AreaState } from './Area.shared.svelte.js';

  let {
    Path,
    Spline,
    curve,
    data,
    defined,
    fill,
    stroke = 'none',
    line = false,
    pathData,
    motion,
    x,
    y0,
    y1,
    seriesKey,
    ...restProps
  }: AreaBaseProps = $props();

  const c = new AreaState(
    () =>
      ({
        curve,
        data,
        defined,
        fill,
        stroke,
        line,
        pathData,
        motion,
        x,
        y0,
        y1,
        seriesKey,
      }) as AreaProps
  );
</script>

{#if line}
  <Spline
    data={data ?? c.seriesData}
    {x}
    y={c.lineYAccessor}
    {seriesKey}
    {curve}
    {defined}
    {motion}
    {...extractLayerProps(line, 'lc-area-line')}
  />
{/if}

<Path
  pathData={c.tweenedPath}
  fill={fill ?? c.series?.color}
  {stroke}
  opacity={c.pathOpacity}
  {...extractLayerProps(restProps, 'lc-area-path')}
/>
