<script lang="ts">
  import Json from '$lib/docs/Json.svelte';
  import { pivotLonger, pivotWider } from '$lib/utils/pivot.js';
  import { wideData, longData } from '$lib/utils/genData.js';
  import Code from '$lib/docs/Code.svelte';
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
