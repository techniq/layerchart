<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLTableRowElement> = $props();
</script>

<tr class={cls('m-0 p-0 border-b last:border-b-0', className)} {...restProps}>
	{@render children?.()}
</tr>
