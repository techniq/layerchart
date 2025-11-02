<script lang="ts">
	import H1 from '$lib/markdown/components/h1.svelte';
	import H2 from '$lib/markdown/components/h2.svelte';
	import { toTitleCase } from '@layerstack/utils';

	let { data } = $props();
</script>

<svelte:head>
	<title>Examples - LayerChart</title>
</svelte:head>

<H1>Examples</H1>
<p class="text-sm text-surface-content/50 mb-6">
	Browse {data.totalExamples} examples across {data.components.length} components
</p>

<div class="grid gap-10">
	{#each data.components as { component, examples }}
		<div>
			<H2>{component}</H2>
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
				{#each examples as example}
					<a
						href="/docs/components/{component}/{example.name}"
						class="group block border border-surface-content/10 bg-surface-100 rounded-xl overflow-hidden hover:border-primary transition-colors elevation-1"
					>
						{#if example.hasLightScreenshot || example.hasDarkScreenshot}
							<div class="aspect-3/2 overflow-hidden">
								<img
									src="/screenshots/{component}/{example.name}-light.png"
									alt="{component} - {example.name}"
									class="w-full h-full object-contain object-center dark:hidden bg-surface-100"
									loading="lazy"
								/>
								<img
									src="/screenshots/{component}/{example.name}-dark.png"
									alt="{component} - {example.name}"
									class="w-full h-full object-contain object-center hidden dark:block bg-surface-200"
									loading="lazy"
								/>
							</div>
						{:else}
							<div class="aspect-3/2 flex items-center justify-center">
								<span class="text-surface-content/30 text-sm">No screenshot</span>
							</div>
						{/if}
						<div class="p-3 border-t">
							<p class="text-sm font-medium group-hover:text-primary transition-colors capitalize">
								{example.name.replaceAll('-', ' ')}
							</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/each}
</div>
