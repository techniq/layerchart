<script lang="ts">
	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideArrowRight from '~icons/lucide/arrow-right';

	let {
		component,
		example,
		showComponent
	}: { component: string; example: string; showComponent?: boolean } = $props();
</script>

<a
	href="/docs/components/{component}/{example}"
	class="group block border border-surface-content/10 bg-surface-100 rounded-xl overflow-hidden hover:border-primary transition-colors elevation-1 hover:bg-primary/5"
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
	<p
		class="flex items-center truncate p-3 gap-1 text-sm font-medium transition-colors capitalize border-t group-hover:border-primary group-hover:text-primary"
	>
		{#if showComponent}
			<span>{component}</span> <LucideChevronRight class="text-surface-content/50" />
		{/if}
		<span class="truncate">{example.replaceAll('-', ' ')}</span>

		<LucideArrowRight
			class="transition-all transform opacity-0 group-hover:opacity-100  -translate-x-full group-hover:translate-x-0"
		/>
	</p>
</a>
