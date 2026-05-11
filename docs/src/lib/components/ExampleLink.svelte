<script lang="ts">
	import { cls } from '@layerstack/tailwind';
	import { tick, type ComponentProps } from 'svelte';

	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideFileCode2 from '~icons/lucide/file-code-2';
	import { ExampleScreenshot, ImageLink } from '@layerstack/docs/components';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { navigating } from '$app/state';

	let {
		component,
		example,
		title,
		showComponent,
		variant = 'default',
		aspect = undefined,
		...restProps
	}: {
		component: string;
		example: string;
		title?: string;
		showComponent?: boolean;
		variant?: ComponentProps<typeof ImageLink>['variant'];
		aspect?: ComponentProps<typeof ExampleScreenshot>['aspect'];
	} & Partial<ComponentProps<typeof ImageLink>> = $props();

	let href = $derived(`/docs/components/${component}/${example}`);

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
		<ExampleScreenshot
			{component}
			{example}
			{aspect}
			background={variant !== 'screenshot-only'}
			{viewTransitionName}
		/>
	{/snippet}

	{#snippet label()}
		<LucideFileCode2
			class={cls(
				'shrink-0 transition text-surface-content/50 mr-1',
				variant === 'default' && 'group-hover:text-primary-content/50'
			)}
		/>

		{#if showComponent}
			<span>{component}</span>
			<LucideChevronRight
				class="shrink-0 text-surface-content/50 group-hover:text-primary-content/50"
			/>
		{/if}
		<span class="first-letter:capitalize truncate">{title ?? example.replaceAll('-', ' ')}</span>
	{/snippet}
</ImageLink>
