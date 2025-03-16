<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Without } from 'layerchart/utils/types.js';
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
    Without<SVGAttributes<SVGGElement>, GeoEdgeFadePropsWithoutHTML>;
</script>

<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { geoDistance } from 'd3-geo';

  import { getGeoContext } from './GeoContext.svelte';

  let {
    link,
    ref = $bindable(),
    children,
    opacity: opacityProp,
    ...restProps
  }: GeoEdgeFadeProps = $props();

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

<g {opacity} bind:this={ref} {...restProps}>
  {@render children?.()}
</g>
