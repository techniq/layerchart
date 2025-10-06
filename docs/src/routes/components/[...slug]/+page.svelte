<script lang="ts">
	let { data } = $props();

	const { Component, metadata } = $derived(data);
</script>

<h1 class="text-3xl font-bold">{metadata.name}</h1>
<div class="text-surface-content/70">{metadata.description}</div>
<div>{metadata.supportedContexts.join(', ')}</div>

<Component />

Related:
<div>{metadata.related.join(', ')}</div>

Source:
<pre class="whitespace-pre">
{JSON.stringify(metadata.source, null, 2)}
</pre>
