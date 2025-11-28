<script lang="ts">
	import { pivotWider } from 'layerchart';

	import Code from '$lib/components/Code.svelte';
	import Json from '$lib/components/Json.svelte';
	import { longData } from '$lib/utils/data';
</script>

<Code source="pivotWider(longData, 'year', 'fruit', 'value')" language="js" />

<h2 class="pt-4">Before</h2>

<Json value={longData} class="rounded-sm" />

<h2>After</h2>

<Json value={pivotWider(longData, 'year', 'fruit', 'value')} class="rounded-sm" />
