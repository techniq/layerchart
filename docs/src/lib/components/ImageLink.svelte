<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cls } from '@layerstack/tailwind';

	import LucideArrowRight from '~icons/lucide/arrow-right';

	let {
		href,
		image,
		label,
		variant = 'default'
	}: {
		href: string;
		image?: Snippet;
		label?: Snippet;
		variant?: 'default' | 'hover-label';
	} = $props();
</script>

<a
	{href}
	class={cls(
		'grid group border border-surface-content/10 bg-surface-100 rounded-xl overflow-hidden hover:border-primary transition-colors elevation-1 hover:bg-primary',
		variant === 'hover-label' ? 'grid-stack' : 'grid-rows-[1fr_auto]'
	)}
>
	{#if image}
		<div class="contents overflow-hidden rounded-lg outline outline-surface-content/10">
			{@render image()}
		</div>
	{/if}

	{#if label}
		<p
			class={cls(
				'flex items-center truncate p-3 gap-1 text-sm font-medium',
				variant === 'hover-label'
					? 'h-12 self-end backdrop-blur-lg bg-surface/80 border-t border-surface-content/5 transition-all duration-300 translate-y-full group-hover:translate-y-0'
					: 'transition-colors group-hover:text-primary-content'
			)}
		>
			{@render label()}

			<LucideArrowRight
				class={cls(
					'shrink-0 text-surface-content/50 transition-all transform opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0',
					variant === 'default' && 'group-hover:text-primary-content/50'
				)}
			/>
		</p>
	{/if}
</a>
