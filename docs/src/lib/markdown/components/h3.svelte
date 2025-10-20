<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import HBase from './h-base.svelte';

	let props: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<HBase tag="h3" class="text-xl font-medium tracking-[-0.01em] mt-8" {...props} />
