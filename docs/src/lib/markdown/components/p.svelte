<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLParagraphElement> = $props();
</script>

<p
	class={cls('text-surface-content/95 leading-8 [main>&:not(:first-child)]:mt-6', className)}
	{...restProps}
>
	{@render children?.()}
</p>
