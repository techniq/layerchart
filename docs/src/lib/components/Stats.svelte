<script lang="ts">
	import { ScrollingValue } from 'svelte-ux';
	import { format } from '@layerstack/utils';
	import { TimerState } from '@layerstack/svelte-state';
	import { getStats } from '$lib/stats.remote';

	const query = getStats();

	let npmEl = $state<HTMLElement>();
	let inViewport = $state(false);
	$effect(() => {
		if (!npmEl) return;
		const observer = new IntersectionObserver(([entry]) => {
			inViewport = entry?.isIntersecting ?? false;
		});
		observer.observe(npmEl);
		return () => observer.disconnect();
	});

	// Cycles the npm downloads interval (weekly, monthly, lifetime) while in view
	const interval = new TimerState({
		initial: 0,
		delay: 8000,
		disabled: true,
		tick: (n) => (n ?? 0) + 1
	});
	$effect(() => {
		if (inViewport) {
			interval.start();
		} else {
			interval.stop();
		}
	});

	const stats = $derived(
		query.current
			? [
					{
						label: ' Downloads',
						value: query.current.npmDownloads,
						link: 'https://npmjs.com/package/layerchart',
						intervals: ['Weekly', 'Monthly', 'Lifetime']
					},
					{
						label: 'GitHub Stars',
						value: query.current.githubStars,
						link: 'https://github.com/techniq/layerchart'
					},
					{
						label: 'Discord Members',
						value: query.current.discordMembers,
						link: 'https://discord.gg/697JhMPD3t'
					},
					{
						label: 'Bluesky Followers',
						value: query.current.bskyFollowers,
						link: 'https://bsky.app/profile/techniq.dev'
					}
				].filter((s) => s.value != null)
			: []
	);
</script>

{#if query.loading || query.error || !query.current}
	<div
		class="grid grid-cols-2 md:grid-cols-4 items-center justify-items-center px-1 py-2 rounded-xl outline m-4 outline-surface-100 h-36 md:h-18 animate-pulse"
	></div>
{:else}
	<div
		class="flex flex-wrap items-center justify-evenly px-1 py-2 rounded-xl outline m-4 outline-surface-content/10"
	>
		{#each stats as { label, value, link, intervals }, index (value)}
			<a
				href={link}
				target="_blank"
				class="flex flex-col justify-center items-center rounded-xl border border-transparent hover:bg-surface-100/50 hover:border-primary/20 whitespace-nowrap w-1/2 md:w-auto"
			>
				{#if intervals}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="h-14 w-36 text-center pt-1"
						bind:this={npmEl}
						onpointerenter={() => interval.stop()}
						onpointerleave={() => interval.start()}
					>
						<ScrollingValue value={interval.current ?? 0} axis="y">
							{@const intervalIndex = (interval.current ?? 0) % intervals.length}
							<div class="text-lg font-bold text-surface-content">
								{format(query.current.npmDownloads[intervalIndex]!, 'metric', {
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
				<div class="w-0.5 h-12 bg-surface-content/5 hidden md:block"></div>
			{/if}
		{/each}
	</div>
{/if}
