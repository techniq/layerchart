<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cls } from '@layerstack/tailwind';
	import type { StatementSync } from 'node:sqlite';

	let {
		children,
		loaded = true,
		hidybarHeight = 'auto', // fixed height to keep it from overlapping reserved space on resize
		class: className = ''
	}: {
		children: Snippet;
		loaded?: boolean;
		hidybarHeight?: string;
		class?: string;
	} = $props();

	let hideybarWrapper = $state<HTMLElement | undefined>();
	let contentWidth = $state(0);
	let bannerHeight: number;
	// Adjust width based on wrapper width changing on resize +/- sidebar and TOC
	$effect(() => {
		void contentWidth; // re-run when layout changes
		bannerHeight = document.querySelector('.banner')?.getBoundingClientRect().height ?? 0;
	});
</script>

<!-- wrapper div provides width/position context for the hidybar and applies header height -->
<div
	bind:this={hideybarWrapper}
	bind:clientWidth={contentWidth}
	style={`height: ${hidybarHeight};`}
	class="-mx-3" /* -margin to distinuish from content */
>
	{#if loaded}
		<header
			class={cls(
				'hidybar fixed z-29 transition-[translate]',
				'bg-radial from-black/0 from-[1px] to-surface-100 to-[1px] bg-size-[6px_6px] backdrop-blur-lg',
				className
			)}
			style={`--header-height: ${bannerHeight}px; top: ${bannerHeight}px; height: ${hidybarHeight}; width: ${contentWidth}px;`}
		>
			{@render children()}
		</header>
	{/if}
</div>

<style>
	:global(html) {
		container-type: scroll-state;
	}

	:global(header.hidybar) {
		@container scroll-state(scrolled: bottom) {
			translate: 0 calc(-100% - var(--header-height));
		}
		/* Override: show when at top (handles no-overflow pages and post-navigation state) */
		@container scroll-state(scrolled: top) {
			translate: none;
		}
	}
</style>
