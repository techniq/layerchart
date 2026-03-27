<script lang="ts">
	let { data } = $props();
	const PageComponent = $derived(data.PageComponent);
</script>

<PageComponent />
