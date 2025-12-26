<script lang="ts">
	import type { Snippet, Component } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';
	import { setContext } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	const { children, class: className, ...restProps }: Props = $props();

	let activeTab = $state(0);
	let tabs = $state<Array<{ label?: string; icon?: string | Component }>>([]);
	let tabCounter = 0;

	// Provide context for Tab components to register themselves
	setContext('tabs', {
		get activeTab() {
			return activeTab;
		},
		setActiveTab: (index: number) => {
			activeTab = index;
		},
		registerTab: (label: string | undefined, icon: string | Component | undefined) => {
			const index = tabCounter++;
			tabs = [...tabs, { label, icon }];
			return index;
		}
	});

	// Convert i-collection-name format to collection:name format for Iconify
	function getIconifyName(name: string): string {
		// If already in collection:name format, use as-is
		if (name.includes(':')) return name;
		// Convert i-collection-name to collection:name
		const match = name.match(/^i-([^-]+)-(.+)$/);
		if (match) {
			const [, collection, iconName] = match;
			return `${collection}:${iconName.replace(/-/g, '-')}`;
		}
		return name;
	}

	// Check if any tabs have string icons (need Iconify)
	const hasIconifyIcons = $derived(tabs.some((tab) => typeof tab.icon === 'string'));
</script>

<svelte:head>
	<!-- Load Iconify web component if needed -->
	{#if hasIconifyIcons}
		<script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js">
		</script>
	{/if}
</svelte:head>

<div class={cls('tabs mt-4 flex flex-col', className)} {...restProps}>
	<!-- Tabs -->
	<div class="flex gap-1 overflow-auto z-1 -mb-px">
		{#each tabs as tab, index}
			{@const isActive = activeTab === index}
			<button
				type="button"
				class={cls(
					'inline-flex items-center gap-1 whitespace-nowrap border px-3 py-2 text-xs transition-colors rounded-t',
					isActive
						? 'bg-surface-100 text-surface-content border-b-surface-100'
						: 'bg-surface-200 text-surface-content/50 hover:text-surface-content'
				)}
				onclick={() => (activeTab = index)}
			>
				{#if tab.icon}
					{#if typeof tab.icon === 'string'}
						<!-- Iconify web component -->
						<iconify-icon icon={getIconifyName(tab.icon)} class="size-4"></iconify-icon>
					{:else}
						<!-- Component import (dynamic by default in runes mode) -->
						{@const IconComponent = tab.icon}
						<IconComponent class="size-4" />
					{/if}
				{/if}
				{tab.label || `Tab ${index + 1}`}
			</button>
		{/each}
	</div>

	<!-- Tab content -->
	<div class="border rounded-lg rounded-tl-none p-3 bg-surface-100">
		{@render children?.()}
	</div>
</div>
