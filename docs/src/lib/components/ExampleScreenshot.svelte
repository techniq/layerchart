<script lang="ts">
	import { cls } from '@layerstack/tailwind';

	let {
		component,
		example,
		aspect = 'initial',
		background = false,
		class: className
	}: {
		component: string;
		example: string;
		aspect?: 'initial' | 'video' | 'square' | 'screenshot';
		background?: boolean;
		class?: string;
	} = $props();
</script>

<div
	class={cls(
		className,
		'h-full',
		aspect === 'video' && 'aspect-video',
		aspect === 'square' && 'aspect-square',
		aspect === 'screenshot' && 'aspect-8/3', // roughly 800x300 for many cartesian
		background && 'bg-surface-100 dark:bg-surface-200'
	)}
>
	<img
		src="/screenshots/{component}/{example}-light.png"
		alt="{component} - {example}"
		class="w-full h-full object-scale-down object-center dark:hidden p-2"
		loading="lazy"
	/>
	<img
		src="/screenshots/{component}/{example}-dark.png"
		alt="{component} - {example}"
		class="w-full h-full object-scale-down object-center hidden dark:block p-2"
		loading="lazy"
	/>
</div>
