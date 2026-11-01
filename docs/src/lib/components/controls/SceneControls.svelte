<script lang="ts">
	import type { Scene } from '@layerchart/3d';
	import { Button, Tooltip } from 'svelte-ux';
	import LucideFocus from '~icons/lucide/focus';
	import LucideHand from '~icons/lucide/hand';
	import LucideRotate3d from '~icons/lucide/rotate-3d';
	import LucideZoomIn from '~icons/lucide/zoom-in';
	import LucideZoomOut from '~icons/lucide/zoom-out';

	/**
	 * Zoom, reset, and drag buttons for a `Scene`, as `TransformContextControls` has for a flat chart.
	 * Place inside the `Chart` (outside the `Scene`), and bind the scene with `bind:this`.
	 */
	let {
		scene,
		drag = $bindable('rotate')
	}: {
		scene: ReturnType<typeof Scene> | undefined;
		/** What a plain drag does; bind it to the `Scene`'s `drag` */
		drag?: 'rotate' | 'pan';
	} = $props();
</script>

<div class="lc-scene-controls screenshot-hidden">
	<Tooltip title="Zoom in">
		<Button icon={LucideZoomIn} on:click={() => scene?.zoomIn()} class="text-surface-content p-2" />
	</Tooltip>
	<Tooltip title="Zoom out">
		<Button
			icon={LucideZoomOut}
			on:click={() => scene?.zoomOut()}
			class="text-surface-content p-2"
		/>
	</Tooltip>
	<Tooltip title="Reset">
		<Button icon={LucideFocus} on:click={() => scene?.reset()} class="text-surface-content p-2" />
	</Tooltip>
	<Tooltip
		title={drag === 'rotate'
			? 'Drag to rotate (shift to pan) — click to pan'
			: 'Drag to pan (shift to rotate) — click to rotate'}
	>
		<Button
			icon={drag === 'rotate' ? LucideRotate3d : LucideHand}
			on:click={() => (drag = drag === 'rotate' ? 'pan' : 'rotate')}
			class="text-surface-content p-2"
		/>
	</Tooltip>
</div>

<style>
	.lc-scene-controls {
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		background: color-mix(
			in oklab,
			var(--color-surface-300, light-dark(white, black)) 50%,
			transparent
		);
		border: 1px solid
			color-mix(in oklab, var(--color-surface-content, currentColor) 20%, transparent);
		border-radius: 9999px;
		margin: 4px;
		backdrop-filter: blur(8px);
		z-index: 10;
	}
</style>
