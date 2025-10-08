<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, href = '', children, ...restProps }: HTMLAnchorAttributes = $props();

	const internal = $derived(href?.startsWith('/') || href?.startsWith('#'));
	const rel = $derived(!internal ? 'noopener noreferrer' : undefined);
	const target = $derived(!internal ? '_blank' : undefined);
</script>

<a {href} {target} {rel} class={cls('link leading-7 text-primary', className)} {...restProps}>
	{@render children?.()}
</a>
