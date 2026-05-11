<script lang="ts">
	import type { Snippet, ComponentProps } from 'svelte';
	import { cls } from '@layerstack/tailwind';
	import { Button } from 'svelte-ux';

	interface Props extends ComponentProps<Button> {
		children: Snippet;
	}

	const {
		label,
		icon,
		href,
		variant = 'fill-light',
		size = 'md',
		class: className,
		children,
		...restProps
	}: Props = $props();

	const internal = $derived(href?.startsWith('/') || href?.startsWith('#'));
	const rel = $derived(!internal ? 'noopener noreferrer' : undefined);
	const target = $derived(!internal ? '_blank' : undefined);
</script>

<Button
	{href}
	{target}
	{rel}
	{icon}
	{variant}
	{size}
	class={cls('button', className)}
	{...restProps}
>
	{@render children?.()}
	{label}
</Button>
