<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  export type GeoEdgeFadePropsWithoutHTML = {
    link: { source: [number, number]; target: [number, number] };
    /**
     * A bindable reference to the underlying `<g>` element.
     * @bindable
     */
    ref?: SVGGElement;

    children?: Snippet;
  };

  export type GeoEdgeFadeProps = GeoEdgeFadePropsWithoutHTML &
    Without<GroupProps, GeoEdgeFadePropsWithoutHTML>;
</script>

<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { geoDistance } from 'd3-geo';

  import { getGeoContext } from './GeoContext.svelte';
  import Group, { type GroupProps } from './Group.svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    link,
    ref: refProp = $bindable(),
    children,
    opacity: opacityProp,
    ...restProps
  }: GeoEdgeFadeProps = $props();

  let ref = $state<SVGGElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const geoCtx = getGeoContext();

  const fade = scaleLinear().domain([-0.1, 0]).range([0, 0.1]);
  const clamper = scaleLinear().domain([0, 1]).range([0, 1]).clamp(true);

  const center = $derived(
    geoCtx.projection?.invert?.(geoCtx.projection?.translate()) ?? ([0, 0] as [number, number])
  );
  const source = $derived(link.source);
  const target = $derived(link.target);
  const startDistance = $derived(1.57 - geoDistance(source, center));
  const endDistance = $derived(1.57 - geoDistance(target, center));
  const distance = $derived(startDistance < endDistance ? startDistance : endDistance);
  const opacity = $derived(opacityProp ?? clamper(fade(distance)));
</script>

<Group {opacity} bind:ref {...extractLayerProps(restProps, 'lc-geo-edge-fade')}>
  {@render children?.()}
</Group>
