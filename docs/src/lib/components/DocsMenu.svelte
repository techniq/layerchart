<script lang="ts">
	import { NavItem } from 'svelte-ux';
	import { group } from 'd3-array';

	import { allComponents } from 'content-collections';
	import { page } from '$app/state';

	let { onItemClick }: { onItemClick?: () => void } = $props();

	const componentsBySection = group(allComponents, (d) => d.section);
</script>

<nav class="flex flex-col gap-6">
	<section>
		<h2 class="mb-4 text-base font-semibold capitalize">Components</h2>
		{#each componentsBySection as [section, components]}
			<div class="mb-4">
				<h3 class="text-surface-content/50 mb-3 text-sm font-medium capitalize">{section}</h3>
				{#each components as component}
					<NavItem
						text={component.name}
						currentUrl={page.url}
						path={`/components/${component.slug}`}
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
