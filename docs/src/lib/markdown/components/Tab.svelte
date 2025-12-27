<script lang="ts">
	import type { Snippet, Component } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';
	import { getContext, untrack } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		label?: string;
		icon?: string | Component;
	}

	const { children, label, icon, class: className, ...restProps }: Props = $props();

	const tabsContext = getContext<{
		activeTab: number;
		setActiveTab: (index: number) => void;
		registerTab: (label: string | undefined, icon: string | Component | undefined) => number;
	}>('tabs');

	// Register this tab and get its index
	// Use untrack to capture the initial values without creating a reactive dependency
	const tabIndex =
		tabsContext?.registerTab(
			untrack(() => label),
			untrack(() => icon)
		) ?? 0;

	const isActive = $derived(tabsContext?.activeTab === tabIndex);
</script>

<div class={cls('tab', !isActive && 'hidden', className)} {...restProps}>
	{@render children?.()}
</div>
