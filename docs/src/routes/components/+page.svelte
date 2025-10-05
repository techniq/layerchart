<script lang="ts">
	let { data } = $props();
</script>

<h1>Components</h1>
<ul class="list-inside list-disc">
	{#each data.components as component}
		<li>
			<a href="/components/{component.id}">{component.id}</a>
		</li>
	{/each}
</ul>
