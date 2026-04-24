<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cls } from '@layerstack/tailwind';

	let {
		children,
		loaded = false,
		headerHeight = '0px',
		hidybarHeight = 'auto',
		class: className = ''
	}: {
		children: Snippet;
		loaded?: boolean;
		headerHeight?: string;
		hidybarHeight?: string;
		class?: string;
	} = $props();

	let hideybarWrapper = $state<HTMLElement | undefined>();
	let contentWidth = $state(0);
	let contentLeft = $state(0);

	// Adjust width based on wrapper width changing on resize +/- sidebar and TOC
	$effect(() => {
		void contentWidth; // re-run when layout changes
		contentLeft = hideybarWrapper?.getBoundingClientRect().left ?? 0;
	});
</script>

<!-- wrapper div provides width/position context for the hidybar and applies header height -->
<div
	bind:this={hideybarWrapper}
	bind:clientWidth={contentWidth}
	style={`height: ${hidybarHeight};`}
>
	{#if loaded}
		<header
			class={cls(
				'hidybar fixed z-31 transition-[translate]',
				'bg-radial from-black/0 from-[1px] to-surface-100 to-[1px] bg-size-[6px_6px] backdrop-blur-lg',
				className
			)}
			style={`--header-height: ${headerHeight}; top: ${headerHeight}; height: ${hidybarHeight}; left: ${contentLeft}px; width: ${contentWidth}px;`}
		>
			{@render children()}
		</header>
	{/if}
	{loaded}
</div>

<style>
	:global(html) {
		container-type: scroll-state;
	}

	:global(header.hidybar) {
		@container scroll-state(scrolled: bottom) {
			translate: 0 calc(-100% - var(--header-height));
		}
	}
</style>
