<script lang="ts">
  import Json from '$lib/docs/Json.svelte';
  import Preview from '$lib/docs/Preview.svelte';
  import { pivotLonger, pivotWider } from '$lib/utils/pivot';
  import { wideData, longData } from '$lib/utils/genData';
  import Code from '$lib/docs/Code.svelte';

  const wideDataDisplay = JSON.stringify(wideData, null, 2);
  const longDataDisplay = JSON.stringify(longData, null, 2);

  const pivotLongerResult = pivotLonger(
    wideData,
    ['apples', 'bananas', 'cherries', 'dates'],
    'fruit',
    'value'
  );
  const pivotLongerDisplay = JSON.stringify(pivotLongerResult, null, 2);

  const pivotWiderResult = pivotWider(longData, 'year', 'fruit', 'value');
  const pivotWiderDisplay = JSON.stringify(pivotWiderResult, null, 2);
</script>

<h1>pivotLonger</h1>

<h2>Before</h2>

<Json value={wideData} class="rounded" />

<h2>After</h2>

<div class="grid gap-2">
  <Code
    source="pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'dates'], 'fruit', 'value')"
    language="js"
  />

  <Json
    value={pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'dates'], 'fruit', 'value')}
    class="rounded"
  />
</div>

<h1>pivotWider</h1>

<h2>Before</h2>

<Json value={longData} class="rounded" />

<h2>After</h2>

<div class="grid gap-2">
  <Code source="pivotWider(longData, 'year', 'fruit', 'value')" language="js" />

  <Json value={pivotWider(longData, 'year', 'fruit', 'value')} class="rounded" />
</div>
