<script lang="ts">
	import { kde } from 'layerchart';

	import Code from '$lib/components/Code.svelte';
	import Json from '$lib/components/Json.svelte';

	const values = [10, 15, 18, 20, 22, 25, 28, 30, 32, 35, 37, 40, 42, 45, 48, 50, 55, 58, 60];
	const result = kde(values, { thresholds: 10 });
</script>

<Code source="kde([10, 15, 18, 20, 22, ...], {{ thresholds: 10 }})" language="js" class="mb-4" />

<div class="text-sm mb-2">Returns [value, density] pairs:</div>

<Json value={result} class="rounded-sm" />
