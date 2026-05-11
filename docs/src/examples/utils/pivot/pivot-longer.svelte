<script lang="ts">
	import { pivotLonger } from 'layerchart';

	import { Code, Json } from '@layerstack/docs/components';
	import { wideData, longData } from '$lib/utils/data';
</script>

<Code
	source="pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'grapes'], 'fruit', 'value')"
	language="js"
	class="mb-4"
/>

<div>Before</div>

<Json value={wideData} class="rounded-sm" />

<div>After</div>

<Json
	value={pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'grapes'], 'fruit', 'value')}
	class="rounded-sm"
/>
