<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<div class="left flex flex-col items-center">
	<div class="circle relative bg-surface-content/20 outline shadow-md rounded-full size-6"></div>
	<div class="line bg-surface-content/10 w-px flex-1"></div>
</div>
<div
	class="right content ml-4 pb-2.5 [&_a]:text-primary [&_a]:font-semibold [&_a]:decoration-primary/50 [&_a:hover]:underline [&_a:hover]:underline-offset-2"
>
	<h2 class="text-lg font-bold">
		{@html title}
	</h2>
	{@render children?.()}
</div>

<style>
	.circle::before {
		@apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2;
		counter-increment: section;
		content: counter(section);
	}

	/* override last one - target the second-to-last child (last left div) */
	.left:nth-last-child(2) .circle::before {
		content: '✔︎';
	}
</style>
