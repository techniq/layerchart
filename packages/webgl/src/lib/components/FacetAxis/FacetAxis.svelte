<script lang="ts">
  import { FacetAxisBase } from 'layerchart/base';
  import Axis from '../Axis/Axis.svelte';
  import Group from '../Group/Group.svelte';
</script>

<!-- The facet grid's headers, drawn with the `Axis` here in whichever layer it's in -->
<FacetAxisBase {Axis} {Group} />
