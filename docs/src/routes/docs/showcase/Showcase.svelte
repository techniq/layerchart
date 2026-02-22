<script lang="ts">
	import { Button } from 'svelte-ux';
	import LucideGithub from '~icons/lucide/github';
	import LucideSquareArrowOutUpRight from '~icons/lucide/square-arrow-out-up-right';
	import type { Dependent } from './dependency.remote';

	let { sites }: { sites: Dependent[] } = $props();
</script>

<div class="grid grid-cols-sm gap-3">
	{#each sites as site}
		<div
			class="flex flex-col border border-primary/20 rounded-lg px-3 py-2 bg-linear-to-b from-primary/8 to-primary/2 backdrop-blur"
		>
			<a href={site.repourl ?? site.homepageurl} target="_blank" class="text-lg font-medium">
				{site.name ?? site.reponame}
			</a>
			{#if site.description}
				<p class="text-sm text-surface-content/50">{site.description}</p>
			{/if}
			<div class="grow flex items-end justify-end gap-1">
				{#if site.repourl}
					<Button
						href={site.repourl}
						target="_blank"
						icon={LucideGithub}
						class="size-7 text-surface-content/50 hover:text-surface-content"
					/>
				{/if}
				{#if site.homepageurl}
					<Button
						href={site.homepageurl}
						target="_blank"
						icon={LucideSquareArrowOutUpRight}
						class="size-7 text-surface-content/50 hover:text-surface-content"
					/>
				{/if}
			</div>
		</div>
	{/each}
</div>
