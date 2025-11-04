<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLTableCellElement> = $props();
</script>

<th
	class={cls(
		'border-b border-r last:border-r-0 px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</th>
