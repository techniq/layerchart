<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLElement> = $props();
</script>

<code class={cls('bg-surface-300', className)} {...restProps}>
	{@render children?.()}
</code>
