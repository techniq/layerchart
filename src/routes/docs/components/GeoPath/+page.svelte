<script lang="ts">
  import { ApiDocs } from 'svelte-ux';

  import api from '$lib/components/GeoPath.svelte?raw&sveld';

  import Chart, { Svg } from '$lib/components/Chart.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
</script>

<h1>Examples</h1>

<Blockquote>TODO</Blockquote>

<h1>API</h1>

<ApiDocs {api} />
