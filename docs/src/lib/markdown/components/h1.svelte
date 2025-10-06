<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h1 class={cls('mt-2 scroll-m-20 text-3xl font-semibold', className)} {...restProps}>
	{@render children?.()}
</h1>
