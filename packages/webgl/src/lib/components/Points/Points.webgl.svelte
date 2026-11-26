<script lang="ts" module>
  import type { PointsProps } from './Points.shared.svelte.js';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { PointsState } from 'layerchart/base';
  import PointsBase from './Points.base.svelte';

  let { children, ...props }: PointsProps = $props();

  // With `children`, each row's point (as the core `Points` places it) for them to draw, ex.
  // `Labels`' text, rather than drawing the points (whether it has them is fixed as it mounts)
  const c = untrack(() => children) ? new PointsState(() => props as any) : null;
</script>

{#if children && c}
  {@render children({ points: c.points })}
{:else}
  <PointsBase {...props} />
{/if}
