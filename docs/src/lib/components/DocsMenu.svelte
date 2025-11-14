<script lang="ts">
	import { NavItem } from 'svelte-ux';
	import { flatGroup } from 'd3-array';

	import { allComponents, allExamples } from 'content-collections';
	import { page } from '$app/state';
	import { sortFunc } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';

	let { onItemClick, class: className }: { onItemClick?: () => void; class?: string } = $props();

	// const examplesBySection = flatGroup(allExamples, (d) => d.section?.toLowerCase())
	// 	.filter(([section]) => section !== 'examples')
	// 	.sort(
	// 		sortFunc(([section]) =>
	// 			['cartesian & polar', 'hierarchy', 'graph', 'force', 'geo'].indexOf(section)
	// 		)
	// 	);

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
	<section class="border-l border-surface-content/10">
		{@render navItem({ label: 'Introduction', path: '/docs/introduction' })}
		{@render navItem({ label: 'Examples', path: '/docs/examples' })}
	</section>

	<!-- <section>
		<h2 class="mb-4 text-base font-semibold capitalize">Examples</h2>
		{#each examplesBySection as [section, examples]}
			<div class="mb-6">
				<h3 class="text-surface-content/50 mb-3 text-sm font-medium capitalize">{section}</h3>
				{#each examples.sort(sortFunc('name')) as example}
					{@render navItem({ label: example.name, path: `/docs/components/${example.slug}` })}
				{/each}
			</div>
		{/each}
	</section> -->

	<section>
		<h2 class="mb-4 text-base font-semibold capitalize">Components</h2>
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

{#snippet navItem({ label, path }: { label: string; path: string })}
	<NavItem
		text={label}
		currentUrl={page.url}
		{path}
		classes={{
			root: 'relative text-sm text-surface-content/50 pl-6 py-1 my-px rounded-r hover:border-surface-content/20 hover:bg-surface-content/5 -ml-px',
			active: cls(
				'text-surface-content! border-surface-content! hover:bg-surface-content/10! font-medium bg-surface-content/10 border-l'
			)
		}}
		on:click={() => onItemClick?.()}
	/>
{/snippet}
