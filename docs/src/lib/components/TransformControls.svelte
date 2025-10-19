<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Placement } from './types.js';

	type Actions = 'zoomIn' | 'zoomOut' | 'center' | 'reset' | 'scrollMode';

	export type TransformControlsPropsWithoutHTML = {
		/**
		 * @default 'top-right'
		 */
		placement?: Placement;

		/**
		 * @default 'vertical'
		 */
		orientation?: 'horizontal' | 'vertical';

		/**
		 * @default 'md'
		 */
		size?: ComponentProps<Button>['size'];

		/**
		 * @default ['zoomIn', 'zoomOut', 'center', 'reset', 'scrollMode']
		 */
		show?: Actions[];
	};

	export type TransformControlsProps = TransformControlsPropsWithoutHTML &
		Without<HTMLAttributes<HTMLElement>, TransformControlsPropsWithoutHTML>;
</script>

<script lang="ts">
	import { type ComponentProps } from 'svelte';
	import { Button, Icon, MenuButton, Tooltip } from 'svelte-ux';

	import LucideFocus from '~icons/lucide/focus';
	import LucideChevronDown from '~icons/lucide/chevron-down';
	import LucideCircleOff from '~icons/lucide/circle-off';
	import LucideImageUpscale from '~icons/lucide/image-upscale';
	import LucideMove from '~icons/lucide/move';
	import LucideUndo2 from '~icons/lucide/undo-2';
	import LucideZoomIn from '~icons/lucide/zoom-in';
	import LucideZoomOut from '~icons/lucide/zoom-out';

	import { getTransformContext } from '$lib/contexts/transform.js';
	import type { Without } from '$lib/utils/types.js';

	let {
		placement = 'top-right',
		orientation = 'vertical',
		size = 'md',
		show = ['zoomIn', 'zoomOut', 'center', 'reset', 'scrollMode'],
		class: className
	}: TransformControlsProps = $props();

	const menuPlacementByOrientationAndPlacement = $derived({
		horizontal: {
			'top-left': 'bottom-end',
			top: 'bottom-end',
			'top-right': 'bottom-end',
			left: 'bottom-end',
			center: 'bottom-end',
			right: 'bottom-end',
			'bottom-left': 'top-end',
			bottom: 'top-end',
			'bottom-right': 'top-end'
		},
		vertical: {
			'top-left': 'right-start',
			top: 'right-start',
			'top-right': 'left-start',
			left: 'right-start',
			center: 'right-start',
			right: 'left-start',
			'bottom-left': 'right-end',
			bottom: 'right-end',
			'bottom-right': 'left-end'
		}
	} as const);

	const transform = getTransformContext();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={['lc-transform-controls', className]}
	data-orientation={orientation}
	data-placement={placement}
	ondblclick={(e) => {
		// Stop from propagating to TransformContext
		e.stopPropagation();
	}}
>
	{#if show.includes('zoomIn')}
		<Tooltip title="Zoom in">
			<Button
				icon={LucideZoomIn}
				on:click={() => transform.zoomIn()}
				{size}
				class="text-surface-content p-2"
			/>
		</Tooltip>
	{/if}

	{#if show.includes('zoomOut')}
		<Tooltip title="Zoom out">
			<Button
				icon={LucideZoomOut}
				on:click={() => transform.zoomOut()}
				{size}
				class="text-surface-content p-2"
			/>
		</Tooltip>
	{/if}

	{#if show.includes('center')}
		<Tooltip title="Center">
			<Button
				icon={LucideFocus}
				on:click={() => transform.translateCenter()}
				{size}
				class="text-surface-content p-2"
			/>
		</Tooltip>
	{/if}

	{#if show.includes('reset')}
		<Tooltip title="Reset">
			<Button
				icon={LucideUndo2}
				on:click={() => transform.reset()}
				{size}
				class="text-surface-content p-2"
			/>
		</Tooltip>
	{/if}

	{#if show.includes('scrollMode')}
		<Tooltip title="Scroll mode">
			<MenuButton
				iconOnly
				options={[
					{ label: 'None', value: 'none', icon: LucideCircleOff },
					{ label: 'Zoom', value: 'scale', icon: LucideImageUpscale },
					{ label: 'Move', value: 'translate', icon: LucideMove }
				]}
				menuProps={{ placement: menuPlacementByOrientationAndPlacement[orientation][placement] }}
				menuIcon={null}
				{size}
				value={transform.scrollMode}
				on:change={(e) => transform.setScrollMode(e.detail.value)}
				class="text-surface-content"
			>
				<svelte:fragment slot="selection" let:value>
					<Icon data={value?.icon ?? LucideChevronDown} />
				</svelte:fragment>
			</MenuButton>
		</Tooltip>
	{/if}
</div>

<style>
	@layer components {
		:where(.lc-transform-controls) {
			display: flex;
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

			&[data-orientation='vertical'] {
				flex-direction: column;
			}

			&[data-placement] {
				position: absolute;
			}

			&[data-placement='top-left'] {
				top: 0;
				left: 0;
			}
			&[data-placement='top'] {
				top: 0;
				left: 50%;
				transform: translateX(-50%);
			}
			&[data-placement='top-right'] {
				top: 0;
				right: 0;
			}
			&[data-placement='left'] {
				top: 50%;
				left: 0;
				transform: translateY(-50%);
			}
			&[data-placement='center'] {
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}
			&[data-placement='right'] {
				top: 50%;
				right: 0;
				transform: translateY(-50%);
			}
			&[data-placement='bottom-left'] {
				bottom: 0;
				left: 0;
			}
			&[data-placement='bottom'] {
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
			}
			&[data-placement='bottom-right'] {
				bottom: 0;
				right: 0;
			}
		}
	}
</style>
