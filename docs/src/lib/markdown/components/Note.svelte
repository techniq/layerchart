<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	import LucideInfo from '~icons/lucide/info';
	import LucideLightbulb from '~icons/lucide/lightbulb';
	import LucideTriangleAlert from '~icons/lucide/triangle-alert';
	import LucideOctagonAlert from '~icons/lucide/octagon-alert';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: 'note' | 'tip' | 'warning' | 'caution';
	}

	const { children, class: className, variant = 'note', ...restProps }: Props = $props();

	const variants = {
		note: { color: 'var(--color-blue-500)', Icon: LucideInfo },
		tip: { color: 'var(--color-green-500)', Icon: LucideLightbulb },
		warning: { color: 'var(--color-amber-500)', Icon: LucideTriangleAlert },
		caution: { color: 'var(--color-red-500)', Icon: LucideOctagonAlert }
	};

	const { color, Icon } = $derived(variants[variant]);
</script>

<div
	class={cls(
		'border border-l-[6px] px-4 py-2 my-4 rounded-sm flex items-center gap-4 text-sm',
		'bg-(--color)/10 border-(--color)/50',
		className
	)}
	style:--color={color}
	{...restProps}
>
	<Icon class="shrink-0 text-(--color)" />
	<div>
		{@render children?.()}
	</div>
</div>
