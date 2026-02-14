<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	const { children, class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class={cls(
		'bg-surface-content/5 border-l-4 px-4 py-2 my-4 text-sm rounded-r',
		'[&>a]:font-medium [&>a]:underline [&>a]:decoration-dashed [&>a]:decoration-primary/50 [&>a]:underline-offset-2',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
