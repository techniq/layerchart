<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import HBase from './h-base.svelte';

	let props: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<HBase tag="h2" class="text-2xl font-semibold tracking-[-0.01em] mt-12 first:mt-0" {...props} />
