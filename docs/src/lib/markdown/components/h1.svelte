<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import HBase from './h-base.svelte';

	let props: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<HBase tag="h1" class="text-3xl font-semibold mt-2" {...props} />
