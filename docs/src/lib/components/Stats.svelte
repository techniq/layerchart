<script lang="ts">
	import { ScrollingValue } from 'svelte-ux';
	import { IsInViewport } from 'runed';
	import { format } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';
	import { getStats } from '$lib/stats.remote';

	const statsPromise = getStats();

	let npmEl = $state<HTMLElement>();
	let npmIndex = $state(0);
	let npmcount = $state(0); // used for npm cycling, npmIndex would reset at end
	const inViewport = new IsInViewport(() => npmEl);

	$effect(() => {
		if (!npmEl) return;

		const interval = setInterval(() => {
			// don't cycle if hovered or not in viewport
			if (npmEl?.matches(':hover') || !inViewport.current) return;
			npmIndex = (npmIndex + 1) % 3;
			npmcount++;
		}, 8000);

		return () => clearInterval(interval);
	});
</script>

{#await statsPromise}
	<div
		class="block sm:flex items-center justify-evenly px-1 py-2 rounded outline m-4 outline-surface-100 h-[72px] animate-pulse"
	></div>
{:then { npmDownloads, githubStars, discordMembers, bskyFollowers }}
	{@const stats = [
		{
			label: ' Downloads',
			value: npmDownloads,
			link: 'https://npmjs.com/package/layerchart',
			intervals: ['Weekly', 'Monthly', 'Lifetime']
		},
		{ label: 'GitHub Stars', value: githubStars, link: 'https://github.com/techniq/layerchart' },
		{ label: 'Discord Members', value: discordMembers, link: 'https://discord.gg/697JhMPD3t' },
		{
			label: 'Bluesky Followers',
			value: bskyFollowers,
			link: 'https://bsky.app/profile/techniq.dev'
		}
	].filter((s) => s.value != null)}

	<div
		class="block sm:flex items-center justify-evenly px-1 py-2 rounded-xl outline m-4 outline-surface-100"
	>
		{#each stats as { label, value, link, intervals }, index (value)}
			<a
				href={link}
				target="_blank"
				class="flex flex-col justify-center items-center rounded-xl border border-transparent hover:bg-surface-100/50 hover:border-primary/20 whitespace-nowrap"
			>
				{#if index === 0}
					<div class="h-14 w-36 text-center pt-1" bind:this={npmEl}>
						<ScrollingValue value={npmcount} axis="y">
							<div class="text-lg font-bold text-surface-content">
								{format(npmDownloads[npmIndex]!, 'metric', { fractionDigits: 1 }).toLowerCase() +
									'+'}
							</div>
							<div class="text-xs text-surface-content/60 text-center">
								{intervals?.[npmIndex]}
								{label}
							</div>
						</ScrollingValue>
					</div>
				{:else}
					<div class="flex flex-col items-center px-4 py-2 text-lg">
						<span class="font-bold text-surface-content"
							>{format(value as number, 'metric', { fractionDigits: 1 }).toLowerCase() + '+'}</span
						>
						<span class="text-xs text-surface-content/60">{label}</span>
					</div>
				{/if}
			</a>
			<div
				class={cls(index === stats.length - 1 && 'hidden', 'sm:w-[2px] sm:h-12 bg-surface-100')}
			></div>
		{/each}
	</div>
{/await}
