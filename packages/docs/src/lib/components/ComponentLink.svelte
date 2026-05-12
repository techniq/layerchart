<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { cls } from '@layerstack/tailwind';

	import LucideBlocks from '~icons/lucide/blocks';

	import ExampleScreenshot from './ExampleScreenshot.svelte';
	import ImageLink from './ImageLink.svelte';

	let {
		component,
		example: exampleProp,
		resolveExample,
		href,
		routeBase = '/docs/components',
		variant = 'default',
		aspect = undefined,
		supportedLayers,
		viewTransitionName = null,
		...restProps
	}: {
		component: string;
		example?: string;
		resolveExample?: (component: string) => string | undefined;
		href?: string;
		routeBase?: string;
		showComponent?: boolean;
		variant?: ComponentProps<typeof ImageLink>['variant'];
		aspect?: ComponentProps<typeof ExampleScreenshot>['aspect'];
		supportedLayers?: string[];
		viewTransitionName?: string | null;
	} & Partial<ComponentProps<typeof ImageLink>> = $props();

	const example = $derived(exampleProp ?? resolveExample?.(component) ?? 'basic');
	const resolvedHref = $derived(href ?? `${routeBase}/${component}`);
</script>

<ImageLink href={resolvedHref} {variant} {...restProps}>
	{#snippet image()}
		<ExampleScreenshot
			{component}
			{example}
			{aspect}
			background
			{viewTransitionName}
			fallbackIcon={LucideBlocks}
		/>
	{/snippet}

	{#snippet label()}
		<LucideBlocks
			class={cls(
				'shrink-0 transition text-surface-content/50 mr-1',
				variant === 'default' && 'group-hover:text-primary-content/50'
			)}
		/>

		<span class="mr-2">{component}</span>

		<div class="grow flex justify-end gap-1">
			{#each supportedLayers as layer}
				<div
					class={cls(
						'border border-current rounded-full px-2 text-surface-content font-semibold',
						layer === 'svg' && 'text-secondary bg-secondary/10',
						layer === 'canvas' && 'text-info bg-info/10',
						layer === 'html' && 'text-success bg-success/10'
					)}
				>
					{layer}
				</div>
			{/each}
		</div>
	{/snippet}
</ImageLink>
