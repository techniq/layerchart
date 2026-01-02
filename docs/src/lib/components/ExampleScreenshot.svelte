<script lang="ts">
	import { cls } from '@layerstack/tailwind';

	let {
		component,
		example,
		aspect = 'initial',
		background = false,
		class: className
	}: {
		component: string;
		example: string;
		aspect?: 'initial' | 'video' | 'square' | 'screenshot';
		background?: boolean;
		class?: string;
	} = $props();

	const basePath = $derived(`/screenshots/${component}/${example}`);
	const viewTransitionName = $derived(`lc-${component}-${example}`);

	const sizes = [
		{ width: '240w', light: '@sm:hidden dark:hidden', dark: 'dark:block dark:@sm:hidden' },
		{
			width: '400w',
			light: '@sm:block @lg:hidden dark:hidden',
			dark: 'dark:@sm:block dark:@lg:hidden'
		},
		{ width: '800w', light: '@lg:block dark:hidden', dark: 'dark:@lg:block' }
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
	{#each ['light', 'dark'] as mode}
		{#each sizes as size}
			<img
				src="{basePath}-{mode}-{size.width}.webp"
				alt="{component} - {example}"
				class={cls(
					'w-full h-full object-scale-down object-center p-2',
					mode === 'light' ? size.light : 'hidden ' + size.dark
				)}
				loading="lazy"
			/>
		{/each}
	{/each}
</div>
