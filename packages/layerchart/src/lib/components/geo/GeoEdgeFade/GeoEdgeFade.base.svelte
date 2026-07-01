<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { GeoEdgeFadeProps } from './GeoEdgeFade.shared.svelte.js';

  export type GeoEdgeFadeBaseLayerComponents = {
    Group: Component<any>;
  };

  export type GeoEdgeFadeBaseProps = GeoEdgeFadeProps & GeoEdgeFadeBaseLayerComponents;
</script>

<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { geoDistance } from 'd3-geo';

  import { getGeoContext } from '$lib/contexts/geo.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    Group,
    link,
    ref: refProp = $bindable(),
    children,
    opacity: opacityProp,
    ...restProps
  }: GeoEdgeFadeBaseProps = $props();

  let ref = $state<SVGGElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const geo = getGeoContext();

  const fade = scaleLinear().domain([-0.1, 0]).range([0, 0.1]);
  const clamper = scaleLinear().domain([0, 1]).range([0, 1]).clamp(true);

  const center = $derived(
    geo.projection?.invert?.(geo.projection?.translate()) ?? ([0, 0] as [number, number])
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
