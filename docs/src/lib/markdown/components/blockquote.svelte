<script lang="ts">
	import { cls } from '@layerstack/tailwind';

	import LucideInfo from '~icons/lucide/info';

	const { children, class: className, ...restProps } = $props();
</script>

<div
	class={cls(
		'bg-primary/10 border border-l-[6px] border-primary/50 text-primary px-4 py-2 my-4 rounded-sm flex items-center gap-2 text-sm',
		'[&>a]:font-medium [&>a]:underline [&>a]:decoration-dashed [&>a]:decoration-primary/50 [&>a]:underline-offset-2',
		className
	)}
	{...restProps}
>
	<LucideInfo class="text-primary" />
	{@render children()}
</div>
