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
