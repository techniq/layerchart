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
		{@render children?.()}
		<LucideLink
			class="inline text-surface-content/50 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0 transition-all scale-70"
		/>
	</a>
</svelte:element>
