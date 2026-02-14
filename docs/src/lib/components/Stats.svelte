<script lang="ts">
	import { ScrollingValue } from 'svelte-ux';
	import { IsInViewport, useInterval } from 'runed';
	import { format } from '@layerstack/utils';
	import { getStats } from '$lib/stats.remote';

	const statsPromise = getStats();

	let npmEl = $state<HTMLElement>();
	const inViewport = new IsInViewport(() => npmEl);

	const interval = useInterval(8000);
	$effect(() => {
		if (inViewport.current) {
			interval.resume();
		} else {
			interval.pause();
		}
	});
</script>

{#await statsPromise}
	<div
		class="block sm:flex items-center justify-evenly px-1 py-2 rounded outline m-4 outline-surface-100 h-18 animate-pulse"
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
		class="block sm:flex items-center justify-evenly px-1 py-2 rounded-xl outline m-4 outline-surface-content/10"
	>
		{#each stats as { label, value, link, intervals }, index (value)}
			<a
				href={link}
				target="_blank"
				class="flex flex-col justify-center items-center rounded-xl border border-transparent hover:bg-surface-100/50 hover:border-primary/20 whitespace-nowrap"
			>
				{#if intervals}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="h-14 w-36 text-center pt-1"
						bind:this={npmEl}
						onpointerenter={() => interval.pause()}
						onpointerleave={() => interval.resume()}
					>
						<ScrollingValue value={interval.counter} axis="y">
							{@const intervalIndex = interval.counter % intervals.length}
							<div class="text-lg font-bold text-surface-content">
								{format(npmDownloads[intervalIndex]!, 'metric', {
									fractionDigits: 1
								}).toLowerCase() + '+'}
							</div>
							<div class="text-xs text-surface-content/60 text-center">
								{intervals[intervalIndex]}
								{label}
							</div>
						</ScrollingValue>
					</div>
				{:else}
					<div class="flex flex-col items-center px-4 py-2 text-lg">
						<span class="font-bold text-surface-content">
							{format(value as number, 'metric', { fractionDigits: 1 }).toLowerCase() + '+'}
						</span>
						<span class="text-xs text-surface-content/60">{label}</span>
					</div>
				{/if}
			</a>

			{#if index < stats.length - 1}
				<div class="sm:w-0.5 sm:h-12 bg-surface-content/5"></div>
			{/if}
		{/each}
	</div>
{/await}
