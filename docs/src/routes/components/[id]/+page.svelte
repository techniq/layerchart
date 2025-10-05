<script lang="ts">
	let { data } = $props();

	const component = $derived(data.component);
</script>

<h1>{component.id}</h1>
<div>{component.description}</div>

{@html component.html}
