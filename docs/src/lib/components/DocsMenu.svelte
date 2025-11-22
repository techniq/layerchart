<script lang="ts">
	import { NavItem, type IconProp } from 'svelte-ux';
	import { flatGroup } from 'd3-array';

	import { allComponents } from 'content-collections';
	import { page } from '$app/state';
	import { sortFunc } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';

	import LucideCompass from '~icons/lucide/compass';
	import LucideGalleryVertical from '~icons/lucide/gallery-vertical';
	import LucideGalleryHorizontalEnd from '~icons/lucide/gallery-horizontal-end';
	import LucideGalleryVerticalEnd from '~icons/lucide/gallery-vertical-end';
	import LucideGlobe from '~icons/lucide/globe';
	import LucideNotebookPen from '~icons/lucide/notebook-pen';
	import LucideBlocks from '~icons/lucide/blocks';
	import LucideFileCode2 from '~icons/lucide/file-code-2';
	import LucideCirclePlay from '~icons/lucide/circle-play';

	let { onItemClick, class: className }: { onItemClick?: () => void; class?: string } = $props();

	const guides = [
		{ name: 'Features', path: 'features' },
		{ name: 'Layers', path: 'layers' },
		{ name: 'Primitives', path: 'primitives' },
		{ name: 'Simplified charts', path: 'simplified-charts' },
		{ name: 'Scales', path: 'scales' },
		{ name: 'State', path: 'state' },
		{ name: 'Styles', path: 'styles' }
	];

	const componentsBySection = flatGroup(allComponents, (d) => d.section?.toLowerCase())
		.filter(([section]) => section !== 'examples')
		.sort(
			sortFunc(([section]) =>
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
				].indexOf(section)
			)
		);
</script>

<nav class={cls('grid gap-6', className)}>
	<section>
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
		{@render navItem({ label: 'Showcase', path: '/docs/showcase', icon: LucideGalleryVertical })}
		{@render navItem({
			label: 'Releases',
			path: 'https://github.com/techniq/layerchart/releases',
			icon: LucideNotebookPen
		})}
	</section>

	<section>
		<h2 class="flex gap-2 items-center mb-4 text-base font-semibold capitalize">
			<LucideGlobe class="size-4 text-surface-content/70" /> Guides
		</h2>
		<div class="border-l border-surface-content/10">
			{#each guides as guide}
				{@render navItem({ label: guide.name, path: `/docs/guides/${guide.path}` })}
			{/each}
		</div>
	</section>

	<section>
		<h2 class="flex gap-2 items-center mb-4 text-base font-semibold capitalize">
			<LucideBlocks class="size-4 text-surface-content/70" /> Components
		</h2>
		{#each componentsBySection as [section, components]}
			<div class="mb-6">
				<h3 class="text-surface-content/80 mb-3 text-sm font-medium capitalize">{section}</h3>
				<div class="border-l border-surface-content/10">
					{#each components.sort(sortFunc('name')) as component}
						{@render navItem({ label: component.name, path: `/docs/components/${component.slug}` })}
					{/each}
				</div>
			</div>
		{/each}
	</section>
</nav>

{#snippet navItem({ label, path, icon }: { label: string; path: string; icon?: IconProp })}
	<NavItem
		text={label}
		currentUrl={page.url}
		target={path.startsWith('http') ? '_blank' : '_self'}
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
