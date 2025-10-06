<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h3
	class={cls('mt-8 scroll-m-20 text-2xl font-medium tracking-[-0.01em]', className)}
	{...restProps}
>
	{@render children?.()}
</h3>
