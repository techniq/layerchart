<script lang="ts">
	import { pivotWider } from 'layerchart';

	import Code from '$lib/components/Code.svelte';
	import Json from '$lib/components/Json.svelte';
	import { longData } from '$lib/utils/data';
</script>

<Code source="pivotWider(longData, 'year', 'fruit', 'value')" language="js" class="mb-4" />

<div>Before</div>

<Json value={longData} class="rounded-sm" />

<div>After</div>

<Json value={pivotWider(longData, 'year', 'fruit', 'value')} class="rounded-sm" />
