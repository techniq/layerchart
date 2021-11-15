<script lang="ts">
	export let code = null;
	export let language = 'svelte';
</script>

<div class="border border-black/20 rounded bg-white">
	<div class="p-4">
		<slot />
	</div>

	{#if code}
		<pre
			class="language-{language} rounded"
			style="margin: 0">
		<code class="language-{language}">
			{@html code}
		</code>
	</pre>
	{/if}
</div>
