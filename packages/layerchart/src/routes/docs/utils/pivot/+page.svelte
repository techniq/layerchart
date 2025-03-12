<script lang="ts">
  import { pivotLonger, pivotWider } from 'layerchart';

  import Code from '$lib/docs/Code.svelte';
  import Json from '$lib/docs/Json.svelte';
  import { wideData, longData } from '$lib/utils/genData.js';
</script>

<h1>pivotLonger</h1>

<Code
  source="pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'grapes'], 'fruit', 'value')"
  language="js"
/>

<h2>Before</h2>

<Json value={wideData} class="rounded-sm" />

<h2>After</h2>

<Json
  value={pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'grapes'], 'fruit', 'value')}
  class="rounded-sm"
/>

<h1>pivotWider</h1>

<Code source="pivotWider(longData, 'year', 'fruit', 'value')" language="js" />

<h2>Before</h2>

<Json value={longData} class="rounded-sm" />

<h2>After</h2>

<Json value={pivotWider(longData, 'year', 'fruit', 'value')} class="rounded-sm" />
