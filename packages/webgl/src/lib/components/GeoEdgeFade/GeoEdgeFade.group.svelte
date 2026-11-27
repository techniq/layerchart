<script lang="ts">
  import type { GroupProps } from '../Group/Group.svelte';
  import Group from '../Group/Group.svelte';

  // `GeoEdgeFadeBase` binds its `Group`'s `ref`, which a scene's group has none of (an element)
  let { ref = $bindable(), ...props }: GroupProps & { ref?: unknown } = $props();
</script>

<Group {...props} />
