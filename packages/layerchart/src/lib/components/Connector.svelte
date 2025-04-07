<script lang="ts" module>
  export type ConnectorPropsWithoutHTML = {
    /**
     * The coordinates of the start point of the connector.
     * @default { x: 0, y: 0 }
     */
    source: ConnectorCoords;

    /**
     * The coordinates of the end point of the connector.
     *
     * @default { x: 100, y: 100 }
     */
    target: ConnectorCoords;

    /**
     * The sweep direction of the connector.
     *
     * @default 'horizontal-vertical'
     */
    sweep?: ConnectorSweep;

    /**
     * The type of the connector.
     *
     * Set to `'d3'` to use a D3 curve function via the `curve` prop.
     *
     * @default 'rounded'
     */
    type?: ConnectorType;

    /**
     * The radius of the connector.
     *
     * Only used when type is `'beveled'` or `'rounded'`
     *
     * @default 20
     */
    radius?: number;

    /**
     * The D3 curve function to use for the connector.
     *
     * Only used when type is `'d3'`
     *
     * @default `d3.curveLinear`
     */
    curve?: CurveFactory;

    /**
     * *Only used when type is 'd3'*
     *
     * Whether to force a linear curve when the source and target are
     * perfectly aligned. When `false`, the curve you specify will be used,
     * regardless of the alignment.
     *
     * @default true
     */
    forceLinearOnAligned?: boolean;
  } & SplinePropsWithoutHTML;

  export type ConnectorProps = ConnectorPropsWithoutHTML &
    Without<SplineProps, ConnectorPropsWithoutHTML>;
</script>

<script lang="ts">
  import { type CurveFactory, curveLinear } from 'd3-shape';
  import {
    getConnectorD3Path,
    getConnectorPresetPath,
    type ConnectorCoords,
    type ConnectorSweep,
    type ConnectorType,
  } from '$lib/utils/connectorUtils.js';
  import Spline, { type SplineProps, type SplinePropsWithoutHTML } from './Spline.svelte';
  import type { Without } from '$lib/utils/types.js';
  import { createId } from '$lib/utils/createId.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import MarkerWrapper from './MarkerWrapper.svelte';
  import {
    createMotion,
    extractTweenConfig,
    type ResolvedMotion,
  } from '$lib/utils/motion.svelte.js';
  import { interpolatePath } from 'd3-interpolate-path';

  const uid = $props.id();

  let {
    source = { x: 0, y: 0 },
    target = { x: 100, y: 100 },
    sweep = 'horizontal-vertical',
    type = 'rounded',
    radius = 20,
    curve = curveLinear,
    forceLinearOnAligned = true,
    splineRef = $bindable(),
    pathData: pathDataProp,
    marker,
    markerStart,
    markerMid,
    markerEnd,
    motion,
    ...restProps
  }: ConnectorProps = $props();

  const markerStartId = $derived(markerStart || marker ? createId('marker-start', uid) : '');
  const markerMidId = $derived(markerMid || marker ? createId('marker-mid', uid) : '');
  const markerEndId = $derived(markerEnd || marker ? createId('marker-end', uid) : '');

  const extractedTween = extractTweenConfig(motion);

  const tweenOptions: ResolvedMotion | undefined = extractedTween
    ? {
        type: extractedTween.type,
        options: {
          interpolate: interpolatePath,
          ...extractedTween.options,
        },
      }
    : undefined;

  const pathData = $derived.by(() => {
    if (pathDataProp) return pathDataProp;
    if (type === 'd3') {
      return getConnectorD3Path({
        source,
        target,
        sweep,
        curve,
        forceLinearOnAligned,
      });
    } else {
      return getConnectorPresetPath({ source, target, sweep, type, radius });
    }
  });

  const motionPath = createMotion(
    '',
    () => pathData,
    tweenOptions ? tweenOptions : { type: 'none' }
  );
</script>

<Spline
  pathData={motionPath.current}
  bind:splineRef
  marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
  marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
  marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
  {...extractLayerProps(restProps, 'connector')}
  {...restProps}
/>
<MarkerWrapper id={markerStartId} marker={markerStart} />
<MarkerWrapper id={markerMidId} marker={markerMid} />
<MarkerWrapper id={markerEndId} marker={markerEnd} />
