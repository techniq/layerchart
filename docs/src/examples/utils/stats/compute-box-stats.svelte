<script lang="ts">
	import { computeBoxStats } from 'layerchart';

	import Code from '$lib/components/Code.svelte';
	import Json from '$lib/components/Json.svelte';

	const values = [2, 7, 8, 12, 15, 18, 21, 25, 27, 30, 32, 35, 38, 40, 42, 45, 50, 55, 60, 85];
	const result = computeBoxStats(values);
</script>

<Code source="computeBoxStats([2, 7, 8, 12, 15, 18, 21, 25, ...])" language="js" class="mb-4" />

<Json value={result} class="rounded-sm" />
