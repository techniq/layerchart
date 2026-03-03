<script lang="ts">
	import { cls } from '@layerstack/tailwind';
	import type { Component } from 'svelte';

	let {
		component,
		example,
		aspect = 'initial',
		background = false,
		viewTransitionName = null,
		fallbackIcon,
		class: className
	}: {
		component: string;
		example: string;
		aspect?: 'initial' | 'video' | 'square' | 'screenshot';
		background?: boolean;
		viewTransitionName?: string | null;
		fallbackIcon?: Component;
		class?: string;
	} = $props();

	let hasError = $state(false);

	const basePath = $derived(`/screenshots/${component}/${example}`);

	const sizes = [
		{ width: '240w', light: 'dark:hidden @sm:hidden', dark: 'hidden dark:block dark:@sm:hidden' },
		{
			width: '400w',
			light: 'hidden @sm:block @lg:hidden dark:hidden',
			dark: 'hidden dark:@sm:block dark:@lg:hidden'
		},
		{ width: '800w', light: 'hidden @lg:block dark:hidden', dark: 'hidden dark:@lg:block' }
	];
</script>

<div
	class={cls(
		className,
		'@container h-full',
		aspect === 'video' && 'aspect-video',
		aspect === 'square' && 'aspect-square',
		aspect === 'screenshot' && 'aspect-8/3', // roughly 800x300 for many cartesian
		background && 'bg-surface-100 dark:bg-surface-200'
	)}
	style:view-transition-name={viewTransitionName}
>
	{#if hasError && fallbackIcon}
		{@const FallbackIcon = fallbackIcon}
		<div class="w-full h-full flex items-center justify-center text-surface-content/30">
			<FallbackIcon class="size-12" />
		</div>
	{:else if !hasError}
		{#each ['light', 'dark'] as mode (mode)}
			{#each sizes as size (size.width)}
				<img
					src="{basePath}-{mode}-{size.width}.webp"
					alt="{component} - {example}"
					class={cls(
						'w-full h-full object-scale-down object-center p-2',
						mode === 'light' ? size.light : size.dark
					)}
					loading="lazy"
					onerror={() => (hasError = true)}
				/>
			{/each}
		{/each}
	{/if}
</div>
