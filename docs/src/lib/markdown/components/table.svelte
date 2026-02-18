<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLTableElement> = $props();
</script>

<div class="my-6 w-full overflow-y-auto rounded-lg border">
	<table class={cls('w-full m-0!', className)} {...restProps}>
		{@render children?.()}
	</table>
</div>
