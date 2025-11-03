<script lang="ts">
	import LucideChevronRight from '~icons/lucide/chevron-right';

	let {
		component,
		example,
		showComponent
	}: { component: string; example: string; showComponent?: boolean } = $props();
</script>

<a
	href="/docs/components/{component}/{example}"
	class="group block border border-surface-content/10 bg-surface-100 rounded-xl overflow-hidden hover:border-primary transition-colors elevation-1"
>
	<!-- {#if example.hasLightScreenshot || example.hasDarkScreenshot} -->
	<div class="aspect-3/2 overflow-hidden">
		<img
			src="/screenshots/{component}/{example}-light.png"
			alt="{component} - {example}"
			class="w-full h-full object-scale-down object-center dark:hidden bg-surface-100 p-4"
			loading="lazy"
		/>
		<img
			src="/screenshots/{component}/{example}-dark.png"
			alt="{component} - {example}"
			class="w-full h-full object-scale-down object-center hidden dark:block bg-surface-200 p-4"
			loading="lazy"
		/>
	</div>
	<!-- {:else}
		<div class="aspect-3/2 flex items-center justify-center">
			<span class="text-surface-content/30 text-sm">No screenshot</span>
		</div>
	{/if} -->
	<div class="p-3 border-t">
		<p
			class="flex items-center truncate gap-1 text-sm font-medium group-hover:text-primary transition-colors capitalize"
		>
			{#if showComponent}
				<span>{component}</span> <LucideChevronRight class="text-surface-content/50" />
			{/if}
			<span class="truncate">{example.replaceAll('-', ' ')}</span>
		</p>
	</div>
</a>
