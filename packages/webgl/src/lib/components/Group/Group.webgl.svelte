<script lang="ts" module>
  import type { GroupProps } from './Group.shared.svelte.js';
</script>

<script lang="ts">
  import { GroupState } from 'layerchart/base';
  import GroupBase from './Group.base.svelte';

  let props: GroupProps = $props();

  // Placed as the core `Group` places itself: `x` / `y` (pixels, or a group per row through the
  // scales), `center`, `motion`, and hidden with its series
  const c = new GroupState(() => props);
</script>

{#if c.hidden}
  <!-- `seriesKey` names a series the legend has hidden -->
{:else if c.dataMode}
  {#each c.resolvedItems as item (item.key)}
    <GroupBase x={item.x} y={item.y} opacity={c.opacity}>
      {@render props.children?.()}
    </GroupBase>
  {/each}
{:else}
  <GroupBase x={c.motionX ?? 0} y={c.motionY ?? 0} opacity={c.opacity}>
    {@render props.children?.()}
  </GroupBase>
{/if}
