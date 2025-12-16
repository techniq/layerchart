<script lang="ts">
	import { cls } from '@layerstack/tailwind';
	import type { TreeViewRootProps } from './types';

	let { children, class: className }: TreeViewRootProps = $props();
</script>

<div class={cls('flex flex-col', className)}>
	{@render children?.()}
</div>
