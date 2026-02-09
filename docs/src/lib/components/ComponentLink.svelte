<script lang="ts">
	import { tick, type ComponentProps } from 'svelte';
	import { cls } from '@layerstack/tailwind';
	import { allComponents } from 'content-collections';

	import LucideBlocks from '~icons/lucide/blocks';

	import ExampleScreenshot from './ExampleScreenshot.svelte';
	import ImageLink from './ImageLink.svelte';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { navigating } from '$app/state';

	let {
		component,
		example: exampleProp,
		variant = 'default',
		aspect = undefined,
		supportedLayers,
		...restProps
	}: {
		component: string;
		example?: string;
		showComponent?: boolean;
		variant?: ComponentProps<typeof ImageLink>['variant'];
		aspect?: ComponentProps<typeof ExampleScreenshot>['aspect'];
		supportedLayers?: string[];
	} & Partial<ComponentProps<typeof ImageLink>> = $props();

	const componentData = $derived(allComponents.find((c) => c.name === component));
	const example = $derived(exampleProp ?? componentData?.defaultExample ?? 'basic');

	let href = $derived(`/docs/components/${component}`);

	// Only enable view transition when navigating to or from this link and remove after navigation to fix stacking order
	let enableViewTransition = $state(navigating.from?.url.pathname === href);
	beforeNavigate((navigation) => {
		if (navigation.to?.url.pathname === href) {
			enableViewTransition = true;
		}
	});
	afterNavigate(() => {
		tick().then(() => {
			enableViewTransition = false;
		});
	});

	const viewTransitionName = $derived(enableViewTransition ? `lc-${component}-${example}` : null);
</script>

<ImageLink {href} {variant} {...restProps}>
	{#snippet image()}
		<ExampleScreenshot {component} {example} {aspect} background {viewTransitionName} />
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
