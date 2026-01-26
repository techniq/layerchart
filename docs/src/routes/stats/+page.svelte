<script lang="ts">
	import { format } from '@layerstack/utils';

	let { weeklyDownloads, stars, bskyFollowers } = $props();
</script>

<div class="@container flex justify-center gap-6 p-4 [&>div+div]:border-l [&>div+div]:pl-6">
	{#if weeklyDownloads != null}
		<div class="flex flex-col items-center justify-center text-center">
			<span class="text-base @sm:text-xl @md:text-2xl font-bold"
				>{format(weeklyDownloads, 'metric', {
					fractionDigits: 1
				})}</span
			>
			<span class="text-xs @sm:text-sm text-surface-content/60">Weekly Downloads</span>
		</div>
	{/if}
	{#if stars != null}
		<div class="flex flex-col items-center justify-center text-center">
			<span class="text-base @sm:text-xl @md:text-2xl font-bold"
				>{format(stars, 'metric', {
					fractionDigits: 1
				})}</span
			>
			<span class="text-xs @sm:text-sm text-surface-content/60">GitHub Stars</span>
		</div>
	{/if}
	<!-- {#if discordMembers != null} -->
	<div class="flex flex-col items-center justify-center text-center">
		<span class="text-base @sm:text-xl @md:text-2xl font-bold"
			>{format(1234, 'metric', {
				fractionDigits: 1
			})}</span
		>
		<span class="text-xs @sm:text-sm text-surface-content/60">Discord Members</span>
	</div>
	<!-- {/if} -->
	{#if bskyFollowers != null}
		<div class="flex flex-col items-center justify-center text-center">
			<span class="text-base @sm:text-xl @md:text-2xl font-bold"
				>{format(bskyFollowers, 'metric', {
					fractionDigits: 1
				})}</span
			>
			<span class="text-xs @sm:text-sm text-surface-content/60">Bluesky Followers</span>
		</div>
	{/if}
</div>
