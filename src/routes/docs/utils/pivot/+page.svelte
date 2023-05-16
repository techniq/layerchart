<script lang="ts">
	import Preview from '$lib/docs/Preview.svelte';
	import { pivotLonger, pivotWider } from '$lib/utils/pivot';
	import { wideData, longData } from '$lib/utils/genData';

	const wideDataDisplay = JSON.stringify(wideData, null, 2);
	const longDataDisplay = JSON.stringify(longData, null, 2);

	const pivotLongerResult = pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'dates'], 'fruit', 'value');
	const pivotLongerDisplay = JSON.stringify(pivotLongerResult, null, 2);

	const pivotWiderResult = pivotWider(longData, 'year', 'fruit', 'value');
	const pivotWiderDisplay = JSON.stringify(pivotWiderResult, null, 2);
</script>

<h1>pivotLonger</h1>

<h2>Before</h2>

<Preview code={wideDataDisplay} highlight showCode>
  wideData
</Preview>

<h2>After</h2>

<Preview code={pivotLongerDisplay} highlight showCode>
	pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'dates'], 'fruit', 'value')
</Preview>

<h1>pivotWider</h1>

<h2>Before</h2>

<Preview code={longDataDisplay} highlight showCode>
  longData
</Preview>

<h2>After</h2>

<Preview code={pivotWiderDisplay} highlight showCode>
	pivotWider(longData, 'year', 'fruit', 'value')
</Preview>
