<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cls } from '@layerstack/tailwind';
	import CodePanel from './CodePanel.svelte';
	import PreviewError from './PreviewError.svelte';
	import { createSandbox } from './state.svelte';

	let {
		source = '',
		preview,
		class: className
	}: {
		source?: string;
		/** The real, statically-imported example. Shown until the user starts editing. */
		preview?: Snippet;
		class?: string;
	} = $props();

	const sandbox = createSandbox(() => source);
</script>

<div class={cls('grid md:grid-cols-2 border rounded-sm overflow-clip', className)}>
	<CodePanel {sandbox} class="min-h-0 overflow-hidden border-b md:border-b-0 md:border-r" />

	<div class="relative overflow-auto p-4 bg-surface-100">
		{#if sandbox.live}
			<div class={cls(sandbox.error && 'opacity-40')} {@attach sandbox.preview}></div>
		{:else}
			{@render preview?.()}
		{/if}

		{#if sandbox.error}
			<PreviewError {...sandbox.error} />
		{:else if sandbox.status}
			<div class="absolute right-2 bottom-1 text-[10px] text-surface-content/40">
				{sandbox.status}
			</div>
		{/if}
	</div>
</div>
