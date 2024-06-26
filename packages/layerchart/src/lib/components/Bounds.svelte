<script lang="ts">
  import { scaleLinear } from 'd3-scale';

  import { chartContext } from './ChartContext.svelte';
  import { motionScale } from '$lib/utils/scales.js';

  const { width, height } = chartContext();

  type Extents = { x0: number; y0: number; x1: number; y1: number };
  type ExtentsAcccessor = (dimensions: { width: number; height: number }) => Extents;

  export let domain: Extents | ExtentsAcccessor;
  export let range: Extents | ExtentsAcccessor;
  export let spring: boolean | Parameters<typeof motionScale>[1]['spring'] = undefined;
  export let tweened: boolean | Parameters<typeof motionScale>[1]['tweened'] = undefined;

  function getExtents(extents: Extents | ExtentsAcccessor, axis: 'x' | 'y', fallback: number) {
    const resolvedExtents =
      typeof extents === 'function' ? extents({ width: $width, height: $height }) : extents;

    return [
      // @ts-ignore
      resolvedExtents?.[axis + '0'] ?? 0, // x0 or y0
      // @ts-ignore
      resolvedExtents?.[axis + '1'] ?? fallback, // x1 or y1, fallback as $width or $height
    ];
  }

  const xScale = motionScale(scaleLinear as any, { spring, tweened });
  $: xScale.domain(getExtents(domain, 'x', $width));
  $: xScale.range(getExtents(range, 'x', $width));

  const yScale = motionScale(scaleLinear as any, { spring, tweened });
  $: yScale.domain(getExtents(domain, 'y', $height));
  $: yScale.range(getExtents(range, 'y', $height));
</script>

<slot xScale={$xScale} yScale={$yScale} />
