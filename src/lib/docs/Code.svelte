<script lang="ts">
	import Prism from 'prismjs';
	import 'prism-svelte';
	import { mdiContentCopy } from '@mdi/js';
	import { Button, cls } from 'svelte-ux';

	export let source: string | null = null;
	export let language = 'svelte';
	export let highlightedSource = source
		? Prism.highlight(source, Prism.languages[language], language)
		: '';
</script>

<div class={cls('rounded', $$restProps.class)}>
	{#if source}
		<div class="relative">
			<pre class="language-{language} rounded" style="margin: 0; white-space: normal;">
            <code class="language-{language}">{@html highlightedSource}</code>
        </pre>

			<div class="absolute top-0 right-0 p-2">
				<Button
					icon={mdiContentCopy}
					class="text-white/70 hover:bg-white/20 py-1"
					size="sm"
					on:click={() => navigator.clipboard.writeText(source ?? '')}
				>
					Copy
				</Button>
			</div>
		</div>
	{/if}
</div>
