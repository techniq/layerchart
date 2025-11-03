<script lang="ts">
	import { NavItem } from 'svelte-ux';
	import { flatGroup } from 'd3-array';

	import { allComponents, allExamples } from 'content-collections';
	import { page } from '$app/state';
	import { sortFunc } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';

	let { onItemClick, class: className }: { onItemClick?: () => void; class?: string } = $props();

	const examplesBySection = flatGroup(allExamples, (d) => d.section?.toLowerCase())
		.filter(([section]) => section !== 'examples')
		.sort(
			sortFunc(([section]) =>
				['cartesian & polar', 'hierarchy', 'graph', 'force', 'geo'].indexOf(section)
			)
		);

	const componentsBySection = flatGroup(allComponents, (d) => d.section?.toLowerCase())
		.filter(([section]) => section !== 'examples')
		.sort(
			sortFunc(([section]) =>
				[
					'charts',
					'common',
					'primitives',
					'marks',
					'annotations',
					'interactions',
					'geo',
					'layout',
					'fill',
					'clipping',
					'other'
				].indexOf(section)
			)
		);
</script>

<nav class={cls('grid gap-6', className)}>
	<section>
		<NavItem
			text="Introduction"
			currentUrl={page.url}
			path="/docs/introduction"
			classes={{
				root: 'text-sm text-surface-content/70 pl-6 py-2 rounded-r border-l hover:border-surface-content/20 hover:bg-surface-content/5',
				active:
					'text-surface-content! border-surface-content! hover:bg-surface-content/5! font-medium'
			}}
			on:click={() => onItemClick?.()}
		/>

		<NavItem
			text="Examples"
			currentUrl={page.url}
			path="/docs/examples"
			classes={{
				root: 'text-sm text-surface-content/70 pl-6 py-2 rounded-r border-l hover:border-surface-content/20 hover:bg-surface-content/5',
				active:
					'text-surface-content! border-surface-content! hover:bg-surface-content/5! font-medium'
			}}
			on:click={() => onItemClick?.()}
		/>
	</section>

	<!-- <section>
		<h2 class="mb-4 text-base font-semibold capitalize">Examples</h2>
		{#each examplesBySection as [section, examples]}
			<div class="mb-6">
				<h3 class="text-surface-content/50 mb-3 text-sm font-medium capitalize">{section}</h3>
				{#each examples.sort(sortFunc('name')) as example}
					<NavItem
						text={example.name}
						currentUrl={page.url}
						path="/docs/examples/{example.slug}"
						classes={{
							root: 'text-sm text-surface-content/70 pl-6 py-2 rounded-r border-l hover:border-surface-content/20 hover:bg-surface-content/5',
							active:
								'text-surface-content! border-surface-content! hover:bg-surface-content/5! font-medium'
						}}
						on:click={() => onItemClick?.()}
					/>
				{/each}
			</div>
		{/each}
	</section> -->

	<section>
		<h2 class="mb-4 text-base font-semibold capitalize">Components</h2>
		{#each componentsBySection as [section, components]}
			<div class="mb-6">
				<h3 class="text-surface-content/50 mb-3 text-sm font-medium capitalize">{section}</h3>
				{#each components.sort(sortFunc('name')) as component}
					<NavItem
						text={component.name}
						currentUrl={page.url}
						path="/docs/components/{component.slug}"
						classes={{
							root: 'text-sm text-surface-content/70 pl-6 py-2 rounded-r border-l hover:border-surface-content/20 hover:bg-surface-content/5',
							active:
								'text-surface-content! border-surface-content! hover:bg-surface-content/5! font-medium'
						}}
						on:click={() => onItemClick?.()}
					/>
				{/each}
			</div>
		{/each}
	</section>
</nav>
