<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cls } from '@layerstack/tailwind';
	import CodePanel from './CodePanel.svelte';
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
			<div {@attach sandbox.preview}></div>
		{:else}
			{@render preview?.()}
		{/if}

		{#if sandbox.status}
			<div
				class={cls(
					'absolute right-2 bottom-1 max-w-[90%] truncate text-[10px]',
					sandbox.hasError ? 'text-danger' : 'text-surface-content/40'
				)}
				title={sandbox.status}
			>
				{sandbox.status}
			</div>
		{/if}
	</div>
</div>
