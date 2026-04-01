<script lang="ts">
	import { useSearchParams } from 'runed/kit';
	import { z } from 'zod';
	import { TextField } from 'svelte-ux';

	import LucideSearch from '~icons/lucide/search';

	import Example from '$lib/components/Example.svelte';
	import H2 from '$lib/markdown/components/h2.svelte';

	let { data } = $props();
	let { catalog } = $derived(data);

	export const schema = z.object({
		filter: z.string().nullable().default(null)
	});
	let params = useSearchParams(schema);

	let visibleExamples = $derived.by(() => {
		if (!params.filter) {
			return catalog?.examples ?? [];
		}

		const query = params.filter.toLowerCase().trim();
		// Split query into words
		const queryWords = query.split(/\s+/);

		// Helper function to split text by hyphens and underscores into words
		const getWords = (text: string) => text.toLowerCase().split(/[-_]/);

		// Helper function to check if all query words match
		const matchesQuery = (text: string) => {
			const textWords = getWords(text);
			// All query words must have a match in the text words
			return queryWords.every((queryWord) =>
				textWords.some((textWord) => textWord.includes(queryWord))
			);
		};

		return (catalog?.examples ?? []).filter((example) => matchesQuery(example.name));
	});
</script>

<div class="mt-10">
	<TextField placeholder="Filter" bind:value={params.filter} clearable>
		{#snippet prepend()}
			<LucideSearch class="text-surface-content/50 mr-4" />
		{/snippet}
	</TextField>
</div>

{#each visibleExamples as example}
	<H2 class="first-letter:capitalize">{example.name.replaceAll('-', ' ')}</H2>
	<Example component={catalog!.component} name={example.name} />
{:else}
	<p>No examples {params.filter ? 'match your filter' : 'available for this component'}.</p>
{/each}
