<script lang="ts">
	import type { Component } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		name?: string; // Iconify icon name (e.g., "lucide:code" or "i-lucide-code")
		component?: Component; // Component import
	}

	const { name, component, class: className, ...restProps }: Props = $props();

	// Convert i-collection-name format to collection:name format for Iconify
	const iconifyName = $derived.by(() => {
		if (!name) return undefined;
		// If already in collection:name format, use as-is
		if (name.includes(':')) return name;
		// Convert i-collection-name to collection:name
		const match = name.match(/^i-([^-]+)-(.+)$/);
		if (match) {
			const [, collection, iconName] = match;
			return `${collection}:${iconName.replace(/-/g, '-')}`;
		}
		return name;
	});
</script>

<svelte:head>
	<!-- Load Iconify web component/script - load unconditionally if Icon component is used -->
	<script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js">
	</script>
</svelte:head>

{#if component}
	<!-- Component import (dynamic by default in runes mode) -->
	{@const IconComponent = component}
	<IconComponent class={cls('inline-block', className)} {...restProps} />
{:else if iconifyName}
	<!-- Iconify web component -->
	<iconify-icon icon={iconifyName} class={cls('inline-block', className)} {...restProps}
	></iconify-icon>
{/if}
