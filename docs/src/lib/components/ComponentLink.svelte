<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { cls } from '@layerstack/tailwind';

	import LucideBlocks from '~icons/lucide/blocks';

	import ExampleScreenshot from './ExampleScreenshot.svelte';
	import ImageLink from './ImageLink.svelte';

	let {
		component,
		example,
		variant = 'default',
		aspect = undefined,
		supportedLayers,
		...restProps
	}: {
		component: string;
		example: string;
		showComponent?: boolean;
		variant?: ComponentProps<typeof ImageLink>['variant'];
		aspect?: ComponentProps<typeof ExampleScreenshot>['aspect'];
		supportedLayers?: string[];
	} & Partial<ComponentProps<typeof ImageLink>> = $props();
</script>

<ImageLink href="/docs/components/{component}/{example}" {variant} {...restProps}>
	{#snippet image()}
		<ExampleScreenshot {component} {example} {aspect} background />
	{/snippet}

	{#snippet label()}
		<LucideBlocks
			class={cls(
				'shrink-0 transition text-surface-content/50 mr-1',
				variant === 'default' && 'group-hover:text-primary-content/50'
			)}
		/>

		<span class="mr-2">{component}</span>

		<div class="flex gap-1">
			{#each supportedLayers as layer}
				<div
					class={cls(
						'border border-current rounded-full px-2 text-surface-content font-semibold',
						layer === 'svg' && 'text-blue-500 bg-blue-500/10',
						layer === 'canvas' && 'text-orange-500 bg-orange-500/10',
						layer === 'html' && 'text-green-500 bg-green-500/10'
					)}
				>
					{layer}
				</div>
			{/each}
		</div>
	{/snippet}
</ImageLink>
