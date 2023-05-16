<script lang="ts">
	import { ApiDocs } from 'svelte-ux';

	import apiAxisX from '$lib/components/AxisX.svelte?raw&sveld';
	import apiAxisY from '$lib/components/AxisY.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import Blockquote from '$lib/docs/Blockquote.svelte';
</script>

<h1>Examples</h1>

<Blockquote>TODO</Blockquote>

<h1>API</h1>

<h2>Axis X</h2>

<ApiDocs api={apiAxisX} />

<h2>Axis Y</h2>

<ApiDocs api={apiAxisY} />
