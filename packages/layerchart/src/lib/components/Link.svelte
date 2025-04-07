<script lang="ts" module>
  import type { MarkerOptions } from './MarkerWrapper.svelte';
  import type { Without } from '$lib/utils/types.js';
  import type { MotionNoneOption, MotionTweenOption } from '$lib/utils/motion.svelte.js';
  import { curveBumpX, curveBumpY, type CurveFactory } from 'd3-shape';

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

    motion?: MotionTweenOption | MotionNoneOption;
  };

  export type LinkProps = LinkPropsWithoutHTML & Without<ConnectorProps, LinkPropsWithoutHTML>;

  const FALLBACK_COORDS = { x: 0, y: 0 };
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
  import Connector, { type ConnectorProps } from './Connector.svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    data,
    sankey = false,
    source: sourceProp,
    target: targetProp,
    orientation: orientationProp,
    x: xProp,
    y: yProp,
    curve: curveProp,
    explicitCoords,
    type = 'd3',
    ...restProps
  }: LinkProps = $props();

  const sourceAccessor = $derived.by(() => {
    if (sourceProp) return sourceProp;
    if (sankey) return (d: any) => ({ node: d.source, y: d.y0, isSource: true });
    return (d: any) => d.source;
  });

  const targetAccessor = $derived.by(() => {
    if (targetProp) return targetProp;
    if (sankey) return (d: any) => ({ node: d.target, y: d.y1, isSource: false });
    return (d: any) => d.target;
  });

  const orientation = $derived.by(() => {
    if (orientationProp) return orientationProp;
    if (sankey) return 'horizontal';
    return 'vertical';
  });

  const curve = $derived.by(() => {
    if (curveProp) return curveProp;
    if (orientation === 'horizontal') return curveBumpX;
    return curveBumpY;
  });

  const xAccessor = $derived.by(() => {
    if (xProp) return xProp;
    if (sankey) return (d: any) => (d.isSource ? d.node.x1 : d.node.x0);
    return (d: any) => (orientation === 'horizontal' ? d.y : d.x);
  });

  const yAccessor = $derived.by(() => {
    if (yProp) return yProp;
    if (sankey) return (d: any) => d.y;
    return (d: any) => (orientation === 'horizontal' ? d.x : d.y);
  });

  const sourceCoords = $derived.by(() => {
    if (explicitCoords) return { x: explicitCoords.x1, y: explicitCoords.y1 };
    if (!data) return FALLBACK_COORDS;

    try {
      const sourceData = sourceAccessor(data);
      if (sourceData == null) return FALLBACK_COORDS;
      const xVal = xAccessor(sourceData);
      const yVal = yAccessor(sourceData);
      return { x: Number.isFinite(xVal) ? xVal : 0, y: Number.isFinite(yVal) ? yVal : 0 };
    } catch (e) {
      console.error('Error accessing source coordinates:', e, 'Data:', data);
      return FALLBACK_COORDS;
    }
  });

  const targetCoords = $derived.by(() => {
    if (explicitCoords) return { x: explicitCoords.x2, y: explicitCoords.y2 };
    if (!data) return FALLBACK_COORDS;

    try {
      const targetData = targetAccessor(data);
      if (targetData == null) return FALLBACK_COORDS;
      const xVal = xAccessor(targetData);
      const yVal = yAccessor(targetData);
      return { x: Number.isFinite(xVal) ? xVal : 0, y: Number.isFinite(yVal) ? yVal : 0 };
    } catch (e) {
      console.error('Error accessing target coordinates:', e, 'Data:', data);
      return FALLBACK_COORDS;
    }
  });
</script>

<Connector
  source={sourceCoords}
  target={targetCoords}
  {type}
  {curve}
  {...extractLayerProps(restProps, 'link')}
/>
