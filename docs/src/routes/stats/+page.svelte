<script lang="ts">
	import { format } from '@layerstack/utils';

	let { weeklyDownloads, stars, discordMembers, bskyFollowers } = $props();

	const stats = $derived(
		[
			{
				label: 'Weekly Downloads',
				value: weeklyDownloads,
				link: 'https://npmjs.com/package/layerchart'
			},
			{ label: 'GitHub Stars', value: stars, link: 'https://github.com/techniq/layerchart' },
			{ label: 'Discord Members', value: discordMembers, link: 'https://discord.gg/697JhMPD3t' },
			{
				label: 'Bluesky Followers',
				value: bskyFollowers,
				link: 'https://bsky.app/profile/techniq.dev'
			}
		].filter((s) => s.value != null)
	);
</script>

<div
	class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 p-4 [&>div+div]:border-t [&>div+div]:pt-3 sm:[&>div+div]:border-t-0 sm:[&>div+div]:border-l sm:[&>div+div]:pt-0 sm:[&>div+div]:pl-6"
>
	{#each stats as { label, value, link }}
		<a
			href={link}
			target="_blank"
			class="flex flex-col items-center justify-center text-center p-1 rounded-lg border border-transparent hover:border-primary/20"
		>
			<span class="text-xs sm:text-base md:text-lg font-bold text-surface-content"
				>{format(value, 'metric', { fractionDigits: 1 })}</span
			>
			<span class="text-xs text-surface-content/60">{label}</span>
		</a>
	{/each}
</div>
