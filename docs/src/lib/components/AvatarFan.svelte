<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Avatar, Icon, Tooltip } from 'svelte-ux';
	import DoubleArrowLeft from '~icons/lucide/chevrons-left';
	import DoubleArrowRight from '~icons/lucide/chevrons-right';

	type People = {
		username: string;
		avatar: string;
		link?: string;
	};

	let {
		people = [] as People[],
		avatarSize = 48,
		scale = 1.7,
		hoverOffset = 20,
		scrollInterval = 100,
		navW = 36
	} = $props();

	const overlap = $derived(avatarSize * 0.6);
	const gap = $derived(avatarSize - overlap); // natural non-overlapping gap between avatars
	const neighborShift = $derived(gap + hoverOffset); // how far neighbors move on hover
	const scalePad = $derived(Math.ceil((avatarSize * scale - avatarSize) / 2));
	const navReserved = $derived(navW * 2);

	let contribsScrollInterval: ReturnType<typeof setInterval> | undefined;
	let visibleCount: number = $state(1);
	let containerWidth: number = $state(0);
	let avatarCarousel: HTMLElement | null = $state(null);
	let scrollIndex: number = $state(0);
	let hoveredIndex: number | null = $state(null);
	let scrollDir = $state(1);
	const maxScroll = $derived(Math.max(0, people.length - visibleCount));

	function countFromWidth(px: number) {
		const available = px - navReserved - neighborShift * 2 - scalePad * 2;
		const count = Math.floor((available - avatarSize) / overlap) + 1;
		return Math.max(1, Math.min(count, people.length));
	}

	const centerOffset = $derived.by(() => {
		const stripWidth = containerWidth - navReserved - neighborShift * 2 - scalePad * 2;
		const groupWidth = (visibleCount - 1) * overlap + avatarSize;
		return Math.max(0, (stripWidth - groupWidth) / 2);
	});

	$effect(() => {
		if (!avatarCarousel) return;
		const ro = new ResizeObserver(([entry]) => {
			containerWidth = entry.contentRect.width;
			visibleCount = countFromWidth(containerWidth);
		});
		ro.observe(avatarCarousel);
		return () => ro.disconnect();
	});

	$effect(() => {
		if (scrollIndex > maxScroll) scrollIndex = maxScroll;
	});

	const visible = $derived(
		people.slice(scrollIndex, scrollIndex + visibleCount).map((person, vi) => {
			let shift = 0;
			if (hoveredIndex !== null) {
				if (vi < hoveredIndex) shift = -neighborShift;
				else if (vi > hoveredIndex) shift = neighborShift;
			}
			return {
				person,
				vi,
				pos: vi * overlap + shift + centerOffset,
				globalIndex: scrollIndex + vi
			};
		})
	);

	function startScroll(dir: -1 | 1) {
		stopScroll();
		doScroll(dir);
		contribsScrollInterval = setInterval(() => doScroll(dir), scrollInterval);
	}
	function doScroll(dir: -1 | 1) {
		scrollDir = dir;
		if (dir === -1 && scrollIndex > 0) scrollIndex--;
		if (dir === 1 && scrollIndex < maxScroll) scrollIndex++;
	}
	function stopScroll() {
		clearInterval(contribsScrollInterval);
		contribsScrollInterval = undefined;
	}
</script>

<div
	bind:this={avatarCarousel}
	class="stack"
	style="--avatar-size:{avatarSize}px; --scale:{scale}; --scale-pad:{scalePad}px; --shift:{neighborShift}px; --nav-w:{navW}px;"
>
	<div
		class="flex flex-1 flex-row overflow-hidden min-w-0 h-[calc(var(--avatar-size)+var(--scale-pad)*2)]"
	>
		<button
			class="flex pl-4 items-center justify-start w-1/2 h-full cursor-pointer z-1 disabled:invisible text-surface-content/30 hover:text-surface-content transition-all duration-600"
			disabled={scrollIndex === 0}
			onmouseenter={() => startScroll(-1)}
			onmouseleave={stopScroll}
			aria-label="Scroll left"
		>
			<Icon data={DoubleArrowLeft} />
		</button>
		<button
			class="flex pr-4 items-center justify-end w-1/2 h-full cursor-pointer z-1 disabled:invisible text-surface-content/30 hover:text-surface-content transition-all duration-600"
			disabled={scrollIndex >= maxScroll}
			onmouseenter={() => startScroll(1)}
			onmouseleave={stopScroll}
			aria-label="Scroll right"
		>
			<Icon data={DoubleArrowRight} />
		</button>
	</div>
	<div class="relative">
		<div
			class="absolute overflow-visible top-(--scale-pad) left-[calc(var(--nav-w)+var(--shift)+var(--scale-pad))] right-[calc(var(--nav-w)+var(--shift)+var(--scale-pad))] bottom-0"
		>
			{#each visible as { person, vi, pos, globalIndex } (globalIndex)}
				<div
					class="absolute top-0 w-(--avatar-size) h-(--avatar-size) [transition:left_0.22s_cubic-bezier(0.4,0,0.2,1),transform_0.18s_ease,opacity_0.18s_ease]"
					style="left:{pos}px; z-index:{hoveredIndex === vi
						? 99
						: visibleCount - vi}; transform:{hoveredIndex === vi
						? 'scale(var(--scale))'
						: 'none'}; opacity:{hoveredIndex !== null && hoveredIndex !== vi ? 0.4 : 1};"
					in:fly={{ x: scrollDir * (avatarSize * 1.5), duration: 240, opacity: 0 }}
					out:fly={{ x: -scrollDir * (avatarSize * 1.5), duration: 240, opacity: 0 }}
				>
					<Tooltip title={person.username} placement="top" offset={8}>
						<button
							class="w-full h-full"
							onmouseenter={() => (hoveredIndex = vi)}
							onmouseleave={() => (hoveredIndex = null)}
						>
							{#if person.link}
								<a href={person.link} target="_blank">
									{@render AvatarSnippet(person)}
								</a>
							{:else}
								{@render AvatarSnippet(person)}
							{/if}
						</button>
					</Tooltip>
				</div>
			{/each}
		</div>
	</div>
</div>

{#snippet AvatarSnippet(person: any)}
	<Avatar size="unset" class="w-(--avatar-size) h-(--avatar-size) overflow-hidden">
		<img src={person.avatar} alt={person.username} />
	</Avatar>
{/snippet}
