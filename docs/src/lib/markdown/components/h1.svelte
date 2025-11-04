<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import HBase from './h-base.svelte';
	import { cls } from '@layerstack/tailwind';

	let { class: className, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<HBase tag="h1" class={cls('text-3xl font-semibold mt-2', className)} {...restProps} />
