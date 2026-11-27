<script lang="ts">
  import { BarsBase } from 'layerchart/base';
  import Group from '../Group/Group.svelte';
  import RadialBar from './Bar.radial.svelte';

  let props: Record<string, any> = $props();
</script>

<!--
  On a `radial` chart, each bar an `Arc`, as the core `Bars` draws them (around the center, its
  value out from it): LayerChart's own bars, drawn with the marks here
-->
<BarsBase Bar={RadialBar} {Group} {...props as any} />
