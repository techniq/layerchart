<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLParagraphElement> = $props();
</script>

<p class={cls('text-surface-content [main>&]:my-5 leading-relaxed', className)} {...restProps}>
	{@render children?.()}
</p>
