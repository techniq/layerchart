<script lang="ts">
	import { Button } from 'svelte-ux';

	import { page } from '$app/state';
	import Example from '$lib/components/Example.svelte';
	import H2 from '$lib/markdown/components/h2.svelte';

	import LucideChevronLeft from '~icons/lucide/chevron-left';

	let { data } = $props();
	let { catalog } = $derived(data);
</script>

{#each catalog?.examples ?? [] as example}
	<H2 class="first-letter:capitalize">{example.name.replaceAll('-', ' ')}</H2>
	<Example component={catalog!.component} name={example.name} />
{:else}
	<p>No examples available for this component.</p>
{/each}
