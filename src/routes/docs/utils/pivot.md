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

## pivotLonger

### Before

<Preview code={wideDataDisplay} highlight>
  wideData
</Preview>

### After

<Preview code={pivotLongerDisplay} highlight>
	pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'dates'], 'fruit', 'value')
</Preview>

## pivotWider

### Before

<Preview code={longDataDisplay} highlight>
  longData
</Preview>

### After

<Preview code={pivotWiderDisplay} highlight>
	pivotWider(longData, 'year', 'fruit', 'value')
</Preview>
