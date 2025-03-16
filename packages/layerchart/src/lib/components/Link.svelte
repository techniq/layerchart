<script lang="ts" module>
  import type { MarkerOptions } from './MarkerWrapper.svelte';
  import type { Without } from 'layerchart/utils/types.js';
  import Spline, { type SplineProps } from './Spline.svelte';

  export type LinkPropsWithoutHTML = {
    // Override what is used from context
    data?: any;

    /**
     * Update source and target accessors to be compatible with d3-sankey.  see: https://github.com/d3/d3-sankey#sankeyLinkHorizontal
     *
     * @default false
     */
    sankey?: boolean;
    source?: (d: any) => any;
    target?: (d: any) => any;

    /**
     * Convenient property to swap x/y accessor logic
     */
    orientation?: 'vertical' | 'horizontal';

    x?: (d: any) => any;
    y?: (d: any) => any;
    curve?: CurveFactory;

    /**
     * Marker to attach to both start and end points of the line
     */
    marker?: MarkerOptions;

    /**
     * Marker to attach to the middle point of the line
     */
    markerMid?: MarkerOptions;

    /**
     * Marker to attach to the start point of the line
     */
    markerStart?: MarkerOptions;

    /**
     * Marker to attach to the end point of the line
     */
    markerEnd?: MarkerOptions;
  } & Pick<MotionProps, 'tweened'>;

  export type LinkProps = LinkPropsWithoutHTML & Without<SplineProps, LinkPropsWithoutHTML>;
</script>

<script lang="ts">
  /*
		TODO:
		- [ ] Show path progressively show / animated in on load.  Also fix sliding in from left side (at last in from bottom)
    - [ ] Support link types
      - [ ] https://airbnb.io/visx/linktypes
        - [ ] https://github.com/airbnb/visx/tree/master/packages/visx-shape/src/shapes/link
      - [ ] https://observablehq.com/@nitaku/corner-connectors
      - [ ] Straight
      - [ ] Square
      - [ ] Beveled
      - [ ] Rounded
    - [ ] Investigate: https://observablehq.com/@fil/sankey-link-paths
    - [ ] Use for annotations - https://github.com/techniq/layerchart/issues/11
	*/
  import { link as d3Link, curveBumpX, curveBumpY, type CurveFactory } from 'd3-shape';
  import { interpolatePath } from 'd3-interpolate-path';

  import { motionState, type MotionProps } from '$lib/stores/motionStore.js';
  import { uniqueId } from '@layerstack/utils';

  import MarkerWrapper from './MarkerWrapper.svelte';

  let {
    data,
    sankey = false,
    source = sankey ? (d: any) => [d.source.x1, d.y0] : (d: any) => d.source,
    target = sankey ? (d: any) => [d.target.x0, d.y1] : (d: any) => d.target,
    orientation = sankey ? 'horizontal' : 'vertical',
    x = (d: any) => (sankey ? d[0] : orientation === 'horizontal' ? d.y : d.x),
    y = (d: any) => (sankey ? d[1] : orientation === 'horizontal' ? d.x : d.y),
    curve = orientation === 'horizontal' ? curveBumpX : curveBumpY,
    marker,
    markerStart = marker,
    markerEnd = marker,
    markerMid = marker,
    tweened,
    ...restProps
  }: LinkProps = $props();

  const markerStartId = $derived(markerStart || marker ? uniqueId('marker-') : '');
  const markerMidId = $derived(markerMid || marker ? uniqueId('marker-') : '');
  const markerEndId = $derived(markerEnd || marker ? uniqueId('marker-') : '');

  const tweenedOptions = $derived(
    tweened
      ? { interpolate: interpolatePath, ...(typeof tweened === 'object' ? tweened : null) }
      : false
  );

  const tweenedState = $derived(motionState('', { tweened: tweenedOptions }));

  $effect(() => {
    orientation;
    const link = d3Link(curve).source(source).target(target).x(x).y(y);
    const d = link(data) ?? '';
    tweenedState.set(d);
  });
</script>

<Spline
  class="path-link"
  pathData={tweenedState.current}
  fill="none"
  marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
  marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
  marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
  {...restProps}
/>
<MarkerWrapper id={markerStartId} marker={markerStart} />
<MarkerWrapper id={markerMidId} marker={markerMid} />
<MarkerWrapper id={markerEndId} marker={markerEnd} />
