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

<svelte:element this={tag} {id} class={cls('scroll-m-20', className)} {...restProps}>
	<a href="#{id}" class="group relative">
		<LucideLink
			class="absolute top-1/2 left-0 text-surface-content/50 opacity-0 group-hover:opacity-100 translate-x-0 -translate-y-1/2 group-hover:-translate-x-full transition-all scale-70"
		/>
		{@render children?.()}
	</a>
</svelte:element>
