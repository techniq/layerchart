<script lang="ts">
	import { NavItem, type IconProp } from 'svelte-ux';
	import { flatGroup } from 'd3-array';

	import { allComponents, allUtils, allGuides } from 'content-collections';
	import { sortCollection } from '$lib/collections';
	import { page } from '$app/state';
	import { sortFunc } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';

	import LucideBot from '~icons/lucide/bot';
	import LucideCompass from '~icons/lucide/compass';
	import LucideGalleryVertical from '~icons/lucide/gallery-vertical';
	import LucideGalleryHorizontalEnd from '~icons/lucide/gallery-horizontal-end';
	import LucideGalleryVerticalEnd from '~icons/lucide/gallery-vertical-end';
	import LucideGlobe from '~icons/lucide/globe';
	import LucideNotebookPen from '~icons/lucide/notebook-pen';
	import LucideBlocks from '~icons/lucide/blocks';
	import LucideFileCode2 from '~icons/lucide/file-code-2';
	import LucideCirclePlay from '~icons/lucide/circle-play';
	import LucideParentheses from '~icons/lucide/parentheses';
	import SimpleIconsStackblitz from '~icons/simple-icons/stackblitz';

	let { onItemClick, class: className }: { onItemClick?: () => void; class?: string } = $props();

	const filteredGuides = allGuides.filter((g) => !g.draft);
	const guidesByCategory = flatGroup(filteredGuides, (d) => d.category?.toLowerCase()).sort(
		sortFunc(([category]) => (category ? 1 : 0))
	);

	const componentsByCategory = flatGroup(allComponents, (d) => d.category?.toLowerCase())
		.filter(([category]) => category !== 'examples')
		.sort(
			sortFunc(([category]) =>
				[
					'charts',
					'common',
					'primitives',
					'marks',
					'geo',
					'layout',
					'interactions',
					'annotations',
					'fill',
					'clipping',
					'layers',
					'other'
				].indexOf(category)
			)
		);
</script>

<nav class={cls('grid gap-6', className)}>
	<section class="border-l border-surface-content/10">
		{@render navItem({
			label: 'Getting Started',
			path: '/docs/getting-started',
			icon: LucideCirclePlay
		})}
		{@render navItem({
			label: 'Examples',
			path: '/docs/examples',
			icon: LucideFileCode2
		})}
		<!-- {@render navItem({
			label: 'Playground',
			path: '/docs/playground',
			icon: SimpleIconsStackblitz
		})} -->
		{@render navItem({ label: 'Showcase', path: '/docs/showcase', icon: LucideGalleryVertical })}
		{@render navItem({
			label: 'Releases',
			path: '/docs/releases',
			icon: LucideNotebookPen
		})}
	</section>

	<section>
		<h2 class="flex gap-2 items-center mb-4 text-base font-semibold capitalize">
			<LucideGlobe class="size-4 text-surface-content/70" /> Guides
		</h2>
		{#each guidesByCategory as [category, guides]}
			{#if category}
				<div class="ml-2 mb-6 last:mb-0">
					<h3 class="text-surface-content/80 mb-3 text-sm font-medium capitalize">{category}</h3>
					<div class="border-l border-surface-content/10">
						{#each sortCollection(guides) as guide}
							{@render navItem({ label: guide.name, path: `/docs/guides/${guide.slug}` })}
						{/each}
					</div>
				</div>
			{:else}
				<div class="ml-2 border-l border-surface-content/10 mb-6 last:mb-0">
					{#each sortCollection(guides) as guide}
						{@render navItem({ label: guide.name, path: `/docs/guides/${guide.slug}` })}
					{/each}
				</div>
			{/if}
		{/each}
	</section>

	<section>
		<h2 class="flex gap-2 items-center mb-4 text-base font-semibold capitalize">
			<LucideBlocks class="size-4 text-surface-content/70" /> Components
		</h2>
		{#each componentsByCategory as [category, components]}
			<div class="ml-2 mb-6 last:mb-0">
				<h3 class="text-surface-content/80 mb-3 text-sm font-medium capitalize">{category}</h3>
				<div class="border-l border-surface-content/10">
					{#each sortCollection(components) as component}
						{@render navItem({ label: component.name, path: `/docs/components/${component.slug}` })}
					{/each}
				</div>
			</div>
		{/each}
	</section>

	<section>
		<h2 class="flex gap-2 items-center mb-3 text-base font-semibold capitalize">
			<LucideParentheses class="size-4 text-surface-content/70" /> Utils
		</h2>
		<div class="ml-2 border-l border-surface-content/10">
			{#each allUtils as util}
				{@render navItem({ label: util.name, path: `/docs/utils/${util.slug}` })}
			{/each}
		</div>
	</section>
</nav>

{#snippet navItem({ label, path, icon }: { label: string; path: string; icon?: IconProp })}
	<NavItem
		text={label}
		currentUrl={page.url}
		target={path.startsWith('http') ? '_blank' : undefined}
		{path}
		{icon}
		classes={{
			root: cls(
				'relative text-sm text-surface-content/50 py-1 my-px rounded-r border-l border-transparent border-surface-content/5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary-600 -ml-px',
				icon ? 'pl-3' : 'pl-6'
			),
			active: cls(
				'text-primary-400! border-primary! hover:bg-primary/10! font-medium bg-primary/10 border-l'
			)
		}}
		on:click={() => onItemClick?.()}
	/>
{/snippet}
