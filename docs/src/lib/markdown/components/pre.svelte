<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLPreElement> = $props();
</script>

<pre class={cls('rounded-lg shadow-md', className)} {...restProps}>
	{@render children?.()}
</pre>
