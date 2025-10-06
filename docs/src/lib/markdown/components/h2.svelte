<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h2
	class={cls('mt-12 scroll-m-20 text-3xl font-semibold tracking-[-0.01em] first:mt-0', className)}
	{...restProps}
>
	{@render children?.()}
</h2>
