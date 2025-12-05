<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Tabs, Tab } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';

	interface Props {
		value?: number; // 0-indexed, starting tab index
		keys: string[];
		content?: Snippet<[number]>;
		placement?: 'top' | 'left' | 'right' | 'bottom';
		activeClass?: string;
		classes?: {
			root?: string;
			tabs?: string;
			tab?: string;
			content?: string;
		};
	}

	let {
		value = $bindable(0),
		keys,
		content,
		placement = 'top',
		activeClass = 'bg-surface-100 border-b-surface-100' /* assuming title header is present */,
		classes = {} as any
	}: Props = $props();

	const classDefaults = {
		root: 'mt-2',
		tabs: 'rounded-t',
		tab: 'rounded-t',
		content: 'p-4 border rounded-b rounded-tr'
	};

	const mergedClasses = {
		root: cls(classDefaults.root, classes.root),
		tabs: cls(classDefaults.tabs, classes.tabs),
		tab: { root: cls(classDefaults.tab, classes.tab) },
		content: cls(classDefaults.content, classes.content)
	};
</script>

<Tabs {placement} classes={mergedClasses} bind:value>
	{#each keys as key, v}
		{@const isActive = value === v}
		<Tab
			class={cls(mergedClasses.tabs, isActive && activeClass)}
			on:click={() => (value = v)}
			selected={isActive}>{key}</Tab
		>
	{/each}
	<svelte:fragment slot="content" let:value>
		<div class="">
			{@render content?.(value)}
		</div>
	</svelte:fragment>
</Tabs>
