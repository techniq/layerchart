<script lang="ts" module>
  import type { MarkerOptions } from './MarkerWrapper.svelte';
  import type { Without } from '$lib/utils/types.js';
  import Spline, { type SplineProps } from './Spline.svelte';
  import { motionState, type MotionProps } from '$lib/stores/motionState.svelte.js';
  import { link as d3Link, curveBumpX, curveBumpY, type CurveFactory } from 'd3-shape';

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

    /**
     * Apply explicit coordinates to the line. Useful when dealing with
     * force simulation links.
     */
    explicitCoords?: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
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
  import { interpolatePath } from 'd3-interpolate-path';

  import MarkerWrapper from './MarkerWrapper.svelte';
  import { createId } from '$lib/utils/createId.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  const uid = $props.id();

  let {
    data,
    sankey = false,
    source: sourceProp,
    target: targetProp,
    orientation: orientationProp,
    x: xProp,
    y: yProp,
    curve: curveProp,
    marker,
    markerStart = marker,
    markerEnd = marker,
    markerMid = marker,
    tweened,
    explicitCoords,
    ...restProps
  }: LinkProps = $props();

  const source = $derived(
    sourceProp ?? (sankey ? (d: any) => [d.source.x1, d.y0] : (d: any) => d.source)
  );
  const target = $derived(
    targetProp ?? (sankey ? (d: any) => [d.target.x0, d.y1] : (d: any) => d.target)
  );
  const orientation = $derived(orientationProp ?? (sankey ? 'horizontal' : 'vertical'));
  const curve = $derived((curveProp ?? orientation === 'horizontal') ? curveBumpX : curveBumpY);

  const x = $derived(
    xProp ?? ((d: any) => (sankey ? d[0] : orientation === 'horizontal' ? d.y : d.x))
  );

  const y = $derived(
    yProp ?? ((d: any) => (sankey ? d[1] : orientation === 'horizontal' ? d.x : d.y))
  );

  const markerStartId = $derived(markerStart || marker ? createId('marker-start', uid) : '');
  const markerMidId = $derived(markerMid || marker ? createId('marker-mid', uid) : '');
  const markerEndId = $derived(markerEnd || marker ? createId('marker-end', uid) : '');

  const tweenedOptions = tweened
    ? { interpolate: interpolatePath, ...(typeof tweened === 'object' ? tweened : null) }
    : false;

  const tweenedState = motionState('', { tweened: tweenedOptions });

  $effect(() => {
    const link = d3Link(curve).source(source).target(target).x(x).y(y);
    let d: string;

    if (explicitCoords !== undefined) {
      // Use explicit coordinates with the same accessors
      const fauxData = {
        source: { x: explicitCoords.x1, y: explicitCoords.y1 },
        target: { x: explicitCoords.x2, y: explicitCoords.y2 },
      } as any;
      d = link(fauxData) ?? '';
    } else {
      d = link(data) ?? '';
    }

    if (!d || d.includes('NaN')) {
      // Safe default to avoid rendering errors
      d = 'M0,0L0,0';
    }

    console.log('d', d);

    tweenedState.target = d;
  });
</script>

<Spline
  pathData={tweenedState.current}
  fill="none"
  marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
  marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
  marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
  {...extractLayerProps(restProps, 'link')}
/>
<MarkerWrapper id={markerStartId} marker={markerStart} />
<MarkerWrapper id={markerMidId} marker={markerMid} />
<MarkerWrapper id={markerEndId} marker={markerEnd} />
