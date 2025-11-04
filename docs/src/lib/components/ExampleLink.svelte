<script lang="ts">
	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideArrowRight from '~icons/lucide/arrow-right';
	import LucideFileCode from '~icons/lucide/file-code';

	let {
		component,
		example,
		showComponent
	}: { component: string; example: string; showComponent?: boolean } = $props();
</script>

<a
	href="/docs/components/{component}/{example}"
	class="group block border border-surface-content/10 bg-surface-100 rounded-xl overflow-hidden hover:border-primary transition-colors elevation-1 hover:bg-primary"
>
	<div class="aspect-3/2 overflow-hidden rounded-lg outline outline-surface-content/10">
		<img
			src="/screenshots/{component}/{example}-light.png"
			alt="{component} - {example}"
			class="w-full h-full object-scale-down object-center dark:hidden bg-surface-100 p-2"
			loading="lazy"
		/>
		<img
			src="/screenshots/{component}/{example}-dark.png"
			alt="{component} - {example}"
			class="w-full h-full object-scale-down object-center hidden dark:block bg-surface-200 p-2"
			loading="lazy"
		/>
	</div>

	<p
		class="flex items-center truncate p-3 gap-1 text-sm font-medium transition-colors capitalize _border-t group-hover:text-primary-content"
	>
		<LucideFileCode
			class="transition text-surface-content/50 group-hover:text-primary-content mr-1"
		/>

		{#if showComponent}
			<span>{component}</span> <LucideChevronRight class="text-surface-content/50" />
		{/if}
		<span class="truncate">{example.replaceAll('-', ' ')}</span>

		<LucideArrowRight
			class="transition-all transform opacity-0 group-hover:opacity-100  -translate-x-full group-hover:translate-x-0"
		/>
	</p>
</a>
