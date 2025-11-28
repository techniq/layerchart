<script lang="ts">
	import { pivotLonger } from 'layerchart';

	import Code from '$lib/components/Code.svelte';
	import Json from '$lib/components/Json.svelte';
	import { wideData, longData } from '$lib/utils/data';
</script>

<Code
	source="pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'grapes'], 'fruit', 'value')"
	language="js"
/>

<h2 class="pt-4">Before</h2>

<Json value={wideData} class="rounded-sm" />

<h2>After</h2>

<Json
	value={pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'grapes'], 'fruit', 'value')}
	class="rounded-sm"
/>
