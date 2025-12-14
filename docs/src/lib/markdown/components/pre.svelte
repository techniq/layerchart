<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let {
		class: className,
		children,
		'data-title': dataTitle,
		...restProps
	}: HTMLAttributes<HTMLPreElement> = $props();
	$inspect({ restProps });
</script>

<pre
	class={cls(
		'text-sm rounded-lg bg-surface-100 dark:bg-surface-300 border border-primary/10 px-4 overflow-x-auto max-w-full',
		className
	)}
	{...restProps}>
	{@render children?.()}
</pre>

<style>
	/* Diff highlighting */
	pre.has-diff :global(.diff-add) {
		background-color: rgb(34 197 94 / 0.15);
		border-left: 3px solid rgb(34 197 94);
		padding-left: 0.5rem;
		margin-left: -0.5rem;
	}

	pre.has-diff :global(.diff-remove) {
		background-color: rgb(239 68 68 / 0.15);
		border-left: 3px solid rgb(239 68 68);
		padding-left: 0.5rem;
		margin-left: -0.5rem;
		opacity: 0.7;
	}

	:global(.dark) pre.has-diff :global(.diff-add) {
		background-color: rgb(34 197 94 / 0.1);
	}

	:global(.dark) pre.has-diff :global(.diff-remove) {
		background-color: rgb(239 68 68 / 0.1);
	}

	/* Line highlighting */
	pre :global(.line-highlight) {
		background-color: rgb(59 130 246 / 0.1);
		border-left: 3px solid rgb(59 130 246);
		padding-left: 0.5rem;
		margin-left: -0.5rem;
	}

	:global(.dark) pre :global(.line-highlight) {
		background-color: rgb(59 130 246 / 0.08);
	}
</style>
