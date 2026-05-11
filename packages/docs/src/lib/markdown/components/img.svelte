<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, ...restProps }: HTMLAttributes<HTMLImageElement> = $props();
</script>

<img class={cls('rounded-lg border', className)} {...restProps} />
