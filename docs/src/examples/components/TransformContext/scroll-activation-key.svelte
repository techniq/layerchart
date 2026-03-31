<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Chart, Layer } from 'layerchart';
	import TransformControls from '$lib/components/controls/TransformContextControls.svelte';
</script>

<p class="text-sm text-surface-content/50 mb-2">Hold <kbd class="px-1 py-0.5 rounded bg-surface-200 text-xs font-mono">⌘ Command</kbd> to zoom with scroll</p>

<Chart
	transform={{
		mode: 'canvas',
		motion: { type: 'tween', duration: 800, easing: cubicOut },
		scrollMode: 'scale',
		scrollActivationKey: 'meta'
	}}
	clip
	height={500}
>
	<TransformControls />

	<Layer type="svg">
		<image
			href="https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg"
			width="100%"
			height="100%"
		/>
	</Layer>
</Chart>
