<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLUListElement> = $props();
</script>

<ul class={cls('my-6 ml-6 list-decimal', className)} {...restProps}>
	{@render children?.()}
</ul>
