<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import HBase from './h-base.svelte';
	import { cls } from '@layerstack/tailwind';

	let { class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<HBase
	tag="h2"
	class={cls('text-2xl font-semibold tracking-[-0.01em] mt-12 mb-1 first:mt-0', className)}
	{...restProps}
/>
