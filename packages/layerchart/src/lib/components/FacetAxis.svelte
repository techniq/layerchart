<script lang="ts">
  import FacetAxisBase from './FacetAxis.base.svelte';
  import Axis from './Axis/Axis.svelte';
  import Group from './Group/Group.svelte';
</script>

<!-- The facet grid's headers, drawn with LayerChart's \`Axis\` -->
<FacetAxisBase {Axis} {Group} />
