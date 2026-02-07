<script lang="ts">
	import { onMount } from 'svelte';
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
		/** Offset from top of the viewport to account for sticky headers, etc */
		scrollOffset?: number;
	} = $props();

	let activeId = $state('');

	onMount(() => {
		const headingElements = items
			.map((item) => document.getElementById(item.id))
			.filter((el): el is HTMLElement => el !== null);

		if (headingElements.length === 0) return;

		const visibleHeadings = new Set<Element>();

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						visibleHeadings.add(entry.target);
					} else {
						visibleHeadings.delete(entry.target);
					}
				}

				// Pick the first visible heading in document order
				const firstVisible = headingElements.find((el) => visibleHeadings.has(el));
				if (firstVisible) {
					activeId = firstVisible.id;
				}
			},
			{ rootMargin: `-${scrollOffset}px 0px 0px 0px` }
		);

		for (const el of headingElements) {
			observer.observe(el);
		}

		return () => observer.disconnect();
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
