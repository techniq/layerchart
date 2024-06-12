<script lang="ts">
  import { pivotLonger, pivotWider } from 'layerchart';

  import Code from '$lib/docs/Code.svelte';
  import Json from '$lib/docs/Json.svelte';
  import { wideData, longData } from '$lib/utils/genData.js';
</script>

<h1>pivotLonger</h1>

<Code
  source="pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'dates'], 'fruit', 'value')"
  language="js"
/>

<h2>Before</h2>

<Json value={wideData} class="rounded" />

<h2>After</h2>

<Json
  value={pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'dates'], 'fruit', 'value')}
  class="rounded"
/>

<h1>pivotWider</h1>

<Code source="pivotWider(longData, 'year', 'fruit', 'value')" language="js" />

<h2>Before</h2>

<Json value={longData} class="rounded" />

<h2>After</h2>

<Json value={pivotWider(longData, 'year', 'fruit', 'value')} class="rounded" />
