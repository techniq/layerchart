<script lang="ts">
	import { ApiDocs } from 'svelte-ux';

	import api from '$lib/components/Circle.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import Blockquote from '$lib/docs/Blockquote.svelte';
</script>

# Examples

<Blockquote>TODO</Blockquote>

# API

<ApiDocs {api} />
