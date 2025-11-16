<script lang="ts">
	import { cls } from '@layerstack/tailwind';

	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideArrowRight from '~icons/lucide/arrow-right';
	import LucideFileCode from '~icons/lucide/file-code';

	let {
		component,
		example,
		showComponent,
		hideLabel = false,
		aspect = undefined
	}: {
		component: string;
		example: string;
		showComponent?: boolean;
		hideLabel?: boolean;
		aspect?: 'video' | 'square' | 'screenshot';
	} = $props();
</script>

<a
	href="/docs/components/{component}/{example}"
	class={cls(
		'grid group border border-surface-content/10 bg-surface-100 rounded-xl overflow-hidden hover:border-primary transition-colors elevation-1 hover:bg-primary',
		hideLabel ? 'grid-stack' : 'grid-rows-[1fr_auto]'
	)}
>
	<div
		class={cls(
			'overflow-hidden rounded-lg outline outline-surface-content/10',
			aspect === 'video' && 'aspect-video',
			aspect === 'square' && 'aspect-square',
			aspect === 'screenshot' && 'aspect-8/3' // roughly 800x300 for many cartesian
		)}
	>
		<img
			src="/screenshots/{component}/{example}-light.png"
			alt="{component} - {example}"
			class="w-full h-full object-scale-down object-center dark:hidden bg-surface-100 p-2"
			loading="lazy"
		/>
		<img
			src="/screenshots/{component}/{example}-dark.png"
			alt="{component} - {example}"
			class="w-full h-full object-scale-down object-center hidden dark:block bg-surface-200 p-2"
			loading="lazy"
		/>
	</div>

	<p
		class={cls(
			'flex items-center truncate p-3 gap-1 text-sm font-medium',
			hideLabel
				? 'h-12 self-end backdrop-blur-lg bg-surface/80 border-t border-surface-content/5 transition-all duration-300 translate-y-full group-hover:translate-y-0'
				: 'transition-colors group-hover:text-primary-content'
		)}
	>
		<LucideFileCode
			class={cls(
				'shrink-0 transition text-surface-content/50 mr-1',
				!hideLabel && 'group-hover:text-primary-content/50'
			)}
		/>

		{#if showComponent}
			<span>{component}</span>
			<LucideChevronRight
				class="shrink-0 text-surface-content/50 group-hover:text-primary-content/50"
			/>
		{/if}
		<span class="first-letter:capitalize truncate">{example.replaceAll('-', ' ')}</span>

		<LucideArrowRight
			class={cls(
				'shrink-0 text-surface-content/50 transition-all transform opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0',
				!hideLabel && 'group-hover:text-primary-content/50'
			)}
		/>
	</p>
</a>
