<script lang="ts">
	import { cls } from '@layerstack/tailwind';
	import type { ComponentProps } from 'svelte';

	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideFileCode2 from '~icons/lucide/file-code-2';
	import ExampleScreenshot from './ExampleScreenshot.svelte';
	import ImageLink from './ImageLink.svelte';

	let {
		component,
		example,
		title,
		showComponent,
		variant = 'default',
		aspect = undefined,
		href,
		routeBase = '/docs/components',
		viewTransitionName = null,
		...restProps
	}: {
		component: string;
		example: string;
		title?: string;
		showComponent?: boolean;
		variant?: ComponentProps<typeof ImageLink>['variant'];
		aspect?: ComponentProps<typeof ExampleScreenshot>['aspect'];
		href?: string;
		routeBase?: string;
		viewTransitionName?: string | null;
	} & Partial<ComponentProps<typeof ImageLink>> = $props();

	const resolvedHref = $derived(href ?? `${routeBase}/${component}/${example}`);
</script>

<ImageLink href={resolvedHref} {variant} {...restProps}>
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
