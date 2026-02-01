<script lang="ts">
	import { onMount } from 'svelte';
	import { scrollY } from 'svelte/reactivity/window';
	import { cls } from '@layerstack/tailwind';

	interface TocItem {
		id: string;
		text: string;
		level: number;
	}

	let {
		items,
		scrollOffset = 80
	}: {
		items: TocItem[];
		/** Additional offset from top of the viewport to consider when determining active heading (sticky headers, etc) */
		scrollOffset?: number;
	} = $props();

	let activeId = $state('');
	let headingElements: HTMLElement[] = [];

	function updateActiveHeading() {
		if (headingElements.length === 0) return;

		const currentScroll = scrollY.current ?? 0;
		const scrollPosition = currentScroll + scrollOffset;

		let foundActive = false;
		for (let i = headingElements.length - 1; i >= 0; i--) {
			const heading = headingElements[i];
			const rect = heading.getBoundingClientRect();
			const absoluteTop = rect.top + currentScroll;

			if (absoluteTop <= scrollPosition) {
				activeId = heading.id;
				foundActive = true;
				break;
			}
		}

		if (!foundActive && headingElements.length > 0) {
			activeId = headingElements[0].id;
		}
	}

	onMount(() => {
		headingElements = items
			.map((item) => document.getElementById(item.id))
			.filter((el): el is HTMLElement => el !== null);

		updateActiveHeading();
	});

	$effect(() => {
		scrollY.current;
		updateActiveHeading();
	});
</script>

{#if items.length}
	<nav aria-label="Table of contents">
		<ul class="list-none m-0 p-0">
			{#each items as item (item.id)}
				<li class="leading-none overflow-x-hidden">
					<a
						href="#{item.id}"
						style:padding-left="{item.level * 12}px"
						class={cls(
							'hover:text-surface-content block w-full overflow-hidden text-ellipsis whitespace-nowrap border-l py-1 text-sm',
							item.level <= 2
								? 'text-surface-content/70 font-medium'
								: 'text-surface-content/50',
							item.id === activeId && 'border-surface-content text-surface-content'
						)}
					>
						{item.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
