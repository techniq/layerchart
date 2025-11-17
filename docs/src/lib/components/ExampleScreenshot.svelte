<script lang="ts">
	import { cls } from '@layerstack/tailwind';

	let {
		component,
		example,
		aspect = 'initial',
		class: className
	}: {
		component: string;
		example: string;
		aspect?: 'initial' | 'video' | 'square' | 'screenshot';
		class?: string;
	} = $props();
</script>

<div
	class={cls(
		className,
		aspect === 'video' && 'aspect-video',
		aspect === 'square' && 'aspect-square',
		aspect === 'screenshot' && 'aspect-8/3' // roughly 800x300 for many cartesian
	)}
>
	<img
		src="/screenshots/{component}/{example}-light.png"
		alt="{component} - {example}"
		class="w-full h-full object-scale-down object-center dark:hidden bg-surface-100 p-2"
		loading="lazy"
	/>
	<img
		src="/screenshots/{component}/{example}-dark.png"
		alt="{component} - {example}"
		class="w-full h-full object-scale-down object-center hidden dark:block bg-surface-200 p-2"
		loading="lazy"
	/>
</div>
