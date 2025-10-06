<script lang="ts">
	let { data } = $props();

	const { Component, metadata } = $derived(data);
</script>

<h1>{metadata.slug}</h1>
<div>{metadata.description}</div>

<Component />
