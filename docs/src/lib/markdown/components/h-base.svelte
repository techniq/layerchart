<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	import LucideLink from '~icons/lucide/link';

	let {
		id,
		tag,
		class: className,
		children,
		...restProps
	}: { tag: string } & HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<svelte:element this={tag} {id} class={cls('group relative scroll-m-20', className)} {...restProps}>
	<LucideLink
		class="absolute left-0 top-0.5 pr-2 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:-translate-x-full transition-all text-surface-content/50"
	/>
	<a href="#{id}">
		{@render children?.()}
	</a>
</svelte:element>
