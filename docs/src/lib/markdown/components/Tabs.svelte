<script lang="ts" module>
	// Shared state for synchronized tabs across instances
	class TabsState {
		activeLabel = $state<string | null>(null);
	}

	const syncedTabs = new Map<string, TabsState>();

	function getSyncedState(key: string) {
		if (!syncedTabs.has(key)) {
			syncedTabs.set(key, new TabsState());
		}
		return syncedTabs.get(key)!;
	}
</script>

<script lang="ts">
	import type { Snippet, Component } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';
	import { setContext } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		key?: string;
		height?: string;
	}

	const { children, key, class: className, height, ...restProps }: Props = $props();

	// Use synced state if key is provided, otherwise use local state
	let localActiveIndex = $state(0);
	let syncedState = $derived(key ? getSyncedState(key) : null);

	let tabs = $state<Array<{ label?: string; icon?: Component }>>([]);
	let tabCounter = 0;

	// Compute active tab index based on synced label or local index
	let activeTab = $derived.by(() => {
		if (syncedState && syncedState.activeLabel !== null) {
			// Find the index of the tab with the matching label
			const index = tabs.findIndex((tab) => tab.label === syncedState.activeLabel);
			return index >= 0 ? index : 0;
		}
		return localActiveIndex;
	});

	// Initialize synced state with first tab's label if not already set
	$effect(() => {
		if (syncedState && syncedState.activeLabel === null && tabs.length > 0) {
			syncedState.activeLabel = tabs[0].label ?? null;
		}
	});

	// Provide context for Tab components to register themselves
	setContext('tabs', {
		get activeTab() {
			return activeTab;
		},
		get hasHeight() {
			return !!height;
		},
		setActiveTab: (index: number) => {
			if (syncedState) {
				syncedState.activeLabel = tabs[index]?.label ?? null;
			} else {
				localActiveIndex = index;
			}
		},
		registerTab: (label: string | undefined, icon: Component | undefined) => {
			const index = tabCounter++;
			tabs = [...tabs, { label, icon }];
			return index;
		}
	});
</script>

<div class={cls('tabs flex my-5 flex-col', className)} {...restProps}>
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
				onclick={() => {
					if (syncedState) {
						syncedState.activeLabel = tab.label ?? null;
					} else {
						localActiveIndex = index;
					}
				}}
			>
				{#if tab.icon}
					<!-- unplugin-icons component -->
					{@const IconComponent = tab.icon}
					<IconComponent class="size-4 fill-surface-content" />
				{/if}
				{tab.label || `Tab ${index + 1}`}
			</button>
		{/each}
	</div>

	<!-- Tab content -->
	<div
		class={cls('border rounded-lg rounded-tl-none px-3 py-1 bg-surface-100', height && 'tabs-has-height overflow-y-scroll')}
		style:height={height}
	>
		{@render children?.()}
	</div>
</div>

<style>
	.tabs-has-height {
		display: flex;
		flex-direction: column;
	}
	:global(.tabs-has-height .tab:not(.hidden)) {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	/* rehype-pretty-code wraps code blocks in <figure> */
	:global(.tabs-has-height .tab:not(.hidden) > figure) {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	:global(.tabs-has-height .tab:not(.hidden) .pre-block) {
		flex: 1;
		min-height: 0;
	}
	:global(.tabs-has-height .tab:not(.hidden) .pre-block > pre) {
		flex: 1;
		min-height: 0;
	}
</style>
