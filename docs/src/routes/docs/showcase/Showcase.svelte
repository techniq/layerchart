<script lang="ts">
	import { Button, Shine, Tilt } from 'svelte-ux';
	import LucideGithub from '~icons/lucide/github';
	import LucideStar from '~icons/lucide/star';
	import LucideSquareArrowOutUpRight from '~icons/lucide/square-arrow-out-up-right';
	import type { Dependent } from './dependency.remote';

	let { sites, hero = false }: { sites: Dependent[]; hero?: boolean } = $props();

	function toSlug(name: string): string {
		return name.toLowerCase().replace(/[^a-z0-9]/g, '');
	}
</script>

<div class="grid grid-cols-sm gap-3">
	{#each sites as site}
		{@const href = site.homepageurl ?? site.repourl}
		<a
			{href}
			target="_blank"
			class="flex flex-col border border-primary/20 hover:border-primary/40 bg-linear-to-b from-primary/8 to-primary/2 backdrop-blur transition-colors duration-500 rounded-lg overflow-hidden no-underline text-inherit"
		>
			{#if hero}
				{@const slug = toSlug(site.name ?? site.reponame ?? '')}
				<div class="h-65 overflow-hidden border-b border-primary/20">
					<Shine classes={{ root: 'w-full h-full' }}>
						<Tilt class="w-full h-full hover:scale-110 transition duration-500">
							<img
								src="/showcase/{slug}.webp"
								alt={site.name ?? site.reponame}
								class="block w-full h-full object-cover object-top transition ease-out duration-500"
								onerror={(e) => {
									const img = e.currentTarget as HTMLImageElement;
									img.onerror = null;
									img.src = '/favicon.svg';
									img.classList.remove('object-cover', 'object-top');
									img.classList.add('object-contain', 'p-6');
									img.style.transform = 'none';
								}}
							/>
						</Tilt>
					</Shine>
				</div>
			{/if}

			<div class="px-3 py-2 flex flex-col grow">
				<span class="text-lg font-medium">{site.name ?? site.reponame}</span>
				{#if site.description}
					<p class="text-sm text-surface-content/50">{site.description}</p>
				{/if}
				<div class="grow flex items-end justify-end gap-1">
					{#if site.stars}
						<span class="flex items-center gap-1 text-sm text-surface-content/50 mr-auto">
							<LucideStar class="size-4" />
							{site.stars.toLocaleString()}
						</span>
					{/if}
					{#if site.repourl}
						<Button
							icon={LucideGithub}
							class="size-7 text-surface-content/50 hover:text-surface-content"
							onclick={(e: MouseEvent) => {
								e.preventDefault();
								window.open(site.repourl, '_blank');
							}}
						/>
					{/if}
					{#if site.homepageurl}
						<Button
							icon={LucideSquareArrowOutUpRight}
							class="size-7 text-surface-content/50 hover:text-surface-content"
							onclick={(e: MouseEvent) => {
								e.preventDefault();
								window.open(site.homepageurl, '_blank');
							}}
						/>
					{/if}
				</div>
			</div>
		</a>
	{/each}
</div>
