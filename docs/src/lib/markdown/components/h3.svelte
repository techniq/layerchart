<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import HBase from './h-base.svelte';
	import { cls } from '@layerstack/tailwind';

	let { class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<HBase
	tag="h3"
	class={cls('text-xl font-medium tracking-[-0.01em] mt-8 mb-1', className)}
	{...restProps}
/>
