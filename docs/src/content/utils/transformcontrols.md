---
name: TransformControls
description: Floating UI toolbar for Chart transformations (zoom, center, reset, scroll mode).
category: tools
layers: []
related: ['guides/transform','components/TransformContext']
---

This is a Svelte component which provides a commonly used UI toolbar for the `TransformContext` component. This allows for easy integration of zoom, pan, and reset functionality into your charts.

::tip
This component has no dependencies aside from LayerChart. This includes no need for Tailwind.
::

```svelte live
<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Chart, Layer } from 'layerchart';
	import TransformControls from '$lib/components/controls/TransformControls.svelte';
</script>

<Chart
	transform={{
		mode: 'canvas',
		motion: { type: 'tween', duration: 800, easing: cubicOut },
		scrollMode: 'scale'
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
```

### Props

| Prop          | Type                                                                                                               | Default                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `placement`   | 'top-left' \| 'top' \| 'top-right' \| 'left' \| 'center' \| 'right' \| 'bottom-left' \| 'bottom' \| 'bottom-right' | 'top-right'                                            |
| `orientation` | 'horizontal' \| 'vertical'                                                                                         | 'vertical'                                             |
| `size`        | 'sm' \| 'md' \| 'lg'                                                                                               | 'md'                                                   |
| `show`        | ('zoomIn' \| 'zoomOut' \| 'center' \| 'reset' \| 'scrollMode')[]                                                   | ['zoomIn', 'zoomOut', 'center', 'reset', 'scrollMode'] |
| `class`       | string                                                                                                             | —                                                      |
