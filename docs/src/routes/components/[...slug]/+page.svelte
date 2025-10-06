<script lang="ts">
	let { data } = $props();

	const { Component, metadata } = $derived(data);
</script>

<h1 class="text-2xl font-semibold">{metadata.name}</h1>
<div>{metadata.description}</div>
<div>{metadata.supportedContexts.join(', ')}</div>

<Component />

Related:
<div>{metadata.related.join(', ')}</div>

Source:
<pre class="whitespace-pre">
{JSON.stringify(metadata.source, null, 2)}
</pre>
