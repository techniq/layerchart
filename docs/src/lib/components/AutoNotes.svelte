<script lang="ts">
	import { getSettings } from 'layerchart';
	import Blockquote from './Blockquote.svelte';
	import { autoNotes, type Note } from '$lib/auto-notes';
	import { fly } from 'svelte/transition';

	let { source }: { source: string } = $props();

	const settings = getSettings();
	let layer = $derived(settings.layer);

	function matchesSource(search: string | RegExp, src: string): boolean {
		if (search instanceof RegExp) return search.test(src);
		const slashPattern = search.match(/^\/(.+)\/$/);
		return slashPattern ? new RegExp(slashPattern[1]).test(src) : false;
	}

	const notes = $derived(
		autoNotes.filter(
			(note: Note) =>
				(!note.layers || note.layers.length === 0 || note.layers?.includes(layer)) &&
				(!note.search || matchesSource(note?.search ?? '', source))
		)
	);
</script>

{#each notes as { text, type }, i (i)}
	<div in:fly={{ x: 300, delay: i * 300 }}>
		<Blockquote type={type ?? 'warning'}>
			<p>{text}</p>
		</Blockquote>
	</div>
{/each}
