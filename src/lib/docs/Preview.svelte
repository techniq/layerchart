<script lang="ts">
	import Prism from 'prismjs';
	import 'prism-svelte';

	export let code = null;
	export let language = 'svelte';
	export let highlight = false;

	$: displayCode = highlight ? Prism.highlight(code, Prism.languages.svelte, 'svelte') : code;
</script>

<div class="border border-black/20 rounded bg-white">
	<div class="p-4">
		<slot />
	</div>

	{#if displayCode}
		<pre
			class="language-{language} rounded"
			style="margin: 0">
		<code class="language-{language}">
			{@html displayCode}
		</code>
	</pre>
	{/if}
</div>
