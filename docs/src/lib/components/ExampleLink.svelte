<script lang="ts">
	import { cls } from '@layerstack/tailwind';
	import type { ComponentProps } from 'svelte';

	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideFileCode from '~icons/lucide/file-code';
	import ExampleScreenshot from './ExampleScreenshot.svelte';
	import ImageLink from './ImageLink.svelte';

	let {
		component,
		example,
		showComponent,
		variant = 'default',
		aspect = undefined,
		...restProps
	}: {
		component: string;
		example: string;
		showComponent?: boolean;
		variant?: ComponentProps<typeof ImageLink>['variant'];
		aspect?: ComponentProps<typeof ExampleScreenshot>['aspect'];
	} & Partial<ComponentProps<typeof ImageLink>> = $props();
</script>

<ImageLink href="/docs/components/{component}/{example}" {variant} {...restProps}>
	{#snippet image()}
		<ExampleScreenshot {component} {example} {aspect} background={variant !== 'screenshot-only'} />
	{/snippet}

	{#snippet label()}
		<LucideFileCode
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
		<span class="first-letter:capitalize truncate">{example.replaceAll('-', ' ')}</span>
	{/snippet}
</ImageLink>
