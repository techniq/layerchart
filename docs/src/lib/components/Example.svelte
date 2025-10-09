<script lang="ts">
	import { examples } from '$lib/context';
	import Code from './Code.svelte';

	let { name }: { name: string } = $props();

	const example = examples.get()?.[name];
</script>

{#if example}
	<example.component />
	<Code source={example.source} />
{:else}
	Example "{name}" not found.
{/if}
