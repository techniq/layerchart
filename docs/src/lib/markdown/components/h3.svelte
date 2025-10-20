<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	import LucideLink from '~icons/lucide/link';

	let {
		id,
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h3
	{id}
	class={cls('group relative mt-8 scroll-m-20 text-xl font-medium tracking-[-0.01em]', className)}
	{...restProps}
>
	<LucideLink
		class="absolute left-0 top-1 pr-2 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:-translate-x-full transition-all text-surface-content/50"
	/>
	<a href="#{id}">
		{@render children?.()}
	</a>
</h3>
