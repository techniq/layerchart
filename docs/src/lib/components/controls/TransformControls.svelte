<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Without } from 'layerchart';

	type Actions = 'zoomIn' | 'zoomOut' | 'center' | 'reset' | 'scrollMode';

	export type ScrollModeValue = 'none' | 'scale' | 'translate';

	// Hardcoded Lucide SVG icon data (24x24 viewBox, stroke="currentColor")
	export const icons = {
		chevronDown: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9l6 6l6-6"/>',
		circleOff: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2 2l20 20M8.35 2.69A10 10 0 0 1 21.3 15.65m-2.22 3.43A10 10 0 1 1 4.92 4.92"/>',
		imageUpscale: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M16 3h5v5m-4 13h2a2 2 0 0 0 2-2m0-7v3m0-12l-5 5M3 7V5a2 2 0 0 1 2-2m0 18l4.144-4.144a1.21 1.21 0 0 1 1.712 0L13 19M9 3h3"/><rect width="10" height="10" x="3" y="11" rx="1"/></g>',
		move: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v20m3-3l-3 3l-3-3M19 9l3 3l-3 3M2 12h20M5 9l-3 3l3 3M9 5l3-3l3 3"/>',
		undo2: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></g>',
		zoomIn: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21l-4.35-4.35M11 8v6m-3-3h6"/></g>',
		zoomOut: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21l-4.35-4.35M8 11h6"/></g>',
		focus: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></g>',
	} as const;

	export const scrollOptions: { label: string; value: ScrollModeValue; icon: string }[] = [
		{ label: 'None', value: 'none', icon: icons.circleOff },
		{ label: 'Zoom', value: 'scale', icon: icons.imageUpscale },
		{ label: 'Move', value: 'translate', icon: icons.move },
	];

	export type Placement =
		| 'top-left'
		| 'top'
		| 'top-right'
		| 'left'
		| 'center'
		| 'right'
		| 'bottom-left'
		| 'bottom'
		| 'bottom-right';

	export type TransformControlButtonSize = 'sm' | 'md' | 'lg';

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
		size?: TransformControlButtonSize;

		/**
		 * @default ['zoomIn', 'zoomOut', 'center', 'reset', 'scrollMode']
		 */
		show?: Actions[];
	};

	export type TransformControlsProps = TransformControlsPropsWithoutHTML &
		Without<HTMLAttributes<HTMLElement>, TransformControlsPropsWithoutHTML>;
</script>

<script lang="ts">
	import { getChartContext } from 'layerchart';

	let {
		placement = 'top-right',
		orientation = 'vertical',
		size = 'md',
		show = ['zoomIn', 'zoomOut', 'center', 'reset', 'scrollMode'],
		class: className
	}: TransformControlsProps = $props();

	const chart = getChartContext();

	const uid = $props.id();
	const menuId = `lc-tc-scroll-menu-${uid}`;
	const tooltipId = `lc-tc-tooltip-${uid}`;
	const anchorName = `--lc-tc-anchor-${uid}`;
	const btnAnchors = {
		zoomIn: `--lc-tc-zoomin-${uid}`,
		zoomOut: `--lc-tc-zoomout-${uid}`,
		center: `--lc-tc-center-${uid}`,
		reset: `--lc-tc-reset-${uid}`,
	};

	let scrollMenuPopoverEl = $state<HTMLDivElement | undefined>(undefined);
	let scrollMenuOpen = $state(false);
	let tooltipEl = $state<HTMLDivElement | undefined>(undefined);
	let tooltipText = $state('');
	let tooltipAnchor = $state('');

	function showTooltip(text: string, anchor: string) {
		tooltipText = text;
		tooltipAnchor = anchor;
		tooltipEl?.showPopover();
	}

	function hideTooltip() {
		tooltipEl?.hidePopover();
	}

	function onScrollMenuToggle(e: ToggleEvent) {
		scrollMenuOpen = e.newState === 'open';
	}

	function selectScrollMode(mode: ScrollModeValue) {
		chart.transform.scrollMode = mode;
		scrollMenuPopoverEl?.hidePopover();
	}

	$effect(() => {
		if (!scrollMenuOpen) return;
		const close = () => scrollMenuPopoverEl?.hidePopover();
		window.addEventListener('resize', close);
		window.addEventListener('scroll', close, true);
		return () => {
			window.removeEventListener('resize', close);
			window.removeEventListener('scroll', close, true);
		};
	});
</script>

{#snippet icon(code: string)}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<svg viewBox="0 0 24 24" aria-hidden="true">{@html code}</svg>
{/snippet}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={['lc-transform-controls screenshot-hidden', className]}
	data-orientation={orientation}
	data-placement={placement}
	data-size={size}
	ondblclick={(e) => {
		// Stop from propagating to TransformContext
		e.stopPropagation();
	}}
>
	{#if show.includes('zoomIn')}
		<button
			type="button"
			style:anchor-name={btnAnchors.zoomIn}
			aria-label="Zoom in"
			aria-describedby={tooltipId}
			onclick={() => chart.transform.zoomIn()}
			onmouseenter={() => showTooltip('Zoom in', btnAnchors.zoomIn)}
			onmouseleave={hideTooltip}
			onfocus={() => showTooltip('Zoom in', btnAnchors.zoomIn)}
			onblur={hideTooltip}
		>
			{@render icon(icons.zoomIn)}
		</button>
	{/if}

	{#if show.includes('zoomOut')}
		<button
			type="button"
			style:anchor-name={btnAnchors.zoomOut}
			aria-label="Zoom out"
			aria-describedby={tooltipId}
			onclick={() => chart.transform.zoomOut()}
			onmouseenter={() => showTooltip('Zoom out', btnAnchors.zoomOut)}
			onmouseleave={hideTooltip}
			onfocus={() => showTooltip('Zoom out', btnAnchors.zoomOut)}
			onblur={hideTooltip}
		>
			{@render icon(icons.zoomOut)}
		</button>
	{/if}

	{#if show.includes('center')}
		<button
			type="button"
			style:anchor-name={btnAnchors.center}
			aria-label="Center"
			aria-describedby={tooltipId}
			onclick={() => chart.transform.translateCenter()}
			onmouseenter={() => showTooltip('Center', btnAnchors.center)}
			onmouseleave={hideTooltip}
			onfocus={() => showTooltip('Center', btnAnchors.center)}
			onblur={hideTooltip}
		>
			{@render icon(icons.focus)}
		</button>
	{/if}

	{#if show.includes('reset')}
		<button
			type="button"
			style:anchor-name={btnAnchors.reset}
			aria-label="Reset"
			aria-describedby={tooltipId}
			onclick={() => chart.transform.reset()}
			onmouseenter={() => showTooltip('Reset', btnAnchors.reset)}
			onmouseleave={hideTooltip}
			onfocus={() => showTooltip('Reset', btnAnchors.reset)}
			onblur={hideTooltip}
		>
			{@render icon(icons.undo2)}
		</button>
	{/if}

	{#if show.includes('scrollMode')}
		<button
			type="button"
			style:anchor-name={anchorName}
			id={`${menuId}-trigger`}
			popovertarget={menuId}
			aria-label="Scroll mode"
			aria-describedby={tooltipId}
			aria-haspopup="menu"
			aria-expanded={scrollMenuOpen}
			aria-controls={menuId}
			onmouseenter={() => showTooltip('Scroll mode', anchorName)}
			onmouseleave={hideTooltip}
			onfocus={() => showTooltip('Scroll mode', anchorName)}
			onblur={hideTooltip}
		>
			{@render icon(scrollOptions.find((o) => o.value === chart.transform.scrollMode)?.icon ?? icons.chevronDown)}
		</button>

		<div
			bind:this={scrollMenuPopoverEl}
			id={menuId}
			popover="auto"
			data-size={size}
			data-orientation={orientation}
			data-placement={placement}
			style:position-anchor={anchorName}
			role="menu"
			aria-labelledby={`${menuId}-trigger`}
			ontoggle={onScrollMenuToggle}
		>
			{#each scrollOptions as opt (opt.value)}
				<button
					type="button"
					role="menuitemradio"
					aria-checked={chart.transform.scrollMode === opt.value}
					onclick={() => selectScrollMode(opt.value)}
				>
					{@render icon(opt.icon)}
					<span>{opt.label}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<div
	bind:this={tooltipEl}
	id={tooltipId}
	popover="manual"
	class="lc-tc-tooltip"
	role="tooltip"
	data-orientation={orientation}
	style:position-anchor={tooltipAnchor}
>
	{tooltipText}
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

			& > button {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				border: none;
				background: transparent;
				color: var(--color-surface-content, currentColor);
				cursor: pointer;
				border-radius: 9999px;
				line-height: 0;
				transition: background-color 0.2s ease;
				font-weight: 500;
				letter-spacing: 0.05em;
			}

			& > button:hover {
				background: color-mix(
					in oklab,
					var(--color-surface-content, currentColor) 10%,
					transparent
				);
			}

			& > button:focus-visible {
				outline: 2px solid
					color-mix(in oklab, var(--color-surface-content, currentColor) 50%, transparent);
				outline-offset: 2px;
			}

			&[data-size='sm'] > button {
				font-size: 0.875rem;
				padding: 0.25rem;
			}
			&[data-size='md'] > button {
				font-size: 1rem;
				padding: 0.5rem;
			}
			&[data-size='lg'] > button {
				font-size: 1.125rem;
				padding: 0.75rem;
			}

			& > button :global(svg) {
				width: 1.2em;
				height: 1.2em;
				flex-shrink: 0;
			}
		}

		/* Popover menu — matched by id prefix since it renders in the top layer,
		   detached from .lc-transform-controls in the box tree. */
		:global([popover][id^='lc-tc-scroll-menu-']) {
			box-sizing: border-box;
			width: max-content;
			padding: 0.25rem;
			margin: 0;
			border: 1px solid
				color-mix(in oklab, var(--color-surface-content, currentColor) 15%, transparent);
			border-radius: 0.5rem;
			background: color-mix(
				in oklab,
				var(--color-surface-300, light-dark(white, black)) 92%,
				transparent
			);
			backdrop-filter: blur(8px);
			box-shadow:
				0 4px 6px -1px
					color-mix(in oklab, var(--color-surface-content, currentColor) 12%, transparent),
				0 2px 4px -2px
					color-mix(in oklab, var(--color-surface-content, currentColor) 10%, transparent);
			color: var(--color-surface-content, currentColor);

			/* Default: open to the right of the trigger */
			position-area: inline-end span-block-end;
			margin-inline-start: 4px;
		}

		:global([popover][id^='lc-tc-scroll-menu-'][data-orientation='horizontal']) {
			position-area: block-end span-inline-start;
			margin-inline-start: 0;
			margin-block-start: 4px;
		}

		:global(
			[popover][id^='lc-tc-scroll-menu-'][data-orientation='horizontal'][data-placement^='bottom']
		) {
			position-area: block-start span-inline-start;
			margin-block-start: 0;
			margin-block-end: 4px;
		}

		:global(
			[popover][id^='lc-tc-scroll-menu-'][data-orientation='vertical'][data-placement='top-right']
		),
		:global(
			[popover][id^='lc-tc-scroll-menu-'][data-orientation='vertical'][data-placement='right']
		),
		:global(
			[popover][id^='lc-tc-scroll-menu-'][data-orientation='vertical'][data-placement='bottom-right']
		) {
			position-area: inline-start span-block-end;
			margin-inline-start: 0;
			margin-inline-end: 4px;
		}

		:global(
			[popover][id^='lc-tc-scroll-menu-'][data-orientation='vertical'][data-placement^='bottom']
		) {
			position-area: inline-end span-block-start;
		}

		:global(
			[popover][id^='lc-tc-scroll-menu-'][data-orientation='vertical'][data-placement='bottom-right']
		) {
			position-area: inline-start span-block-start;
		}

		:global([popover][id^='lc-tc-scroll-menu-'] > button) {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			width: 100%;
			border: none;
			background: transparent;
			color: inherit;
			cursor: pointer;
			text-align: left;
			border-radius: 0.375rem;
			font: inherit;
		}

		:global([popover][id^='lc-tc-scroll-menu-'] > button:hover),
		:global([popover][id^='lc-tc-scroll-menu-'] > button:focus-visible) {
			background: color-mix(in oklab, var(--color-surface-content, currentColor) 8%, transparent);
		}

		:global([popover][id^='lc-tc-scroll-menu-'] > button:focus-visible) {
			outline: 2px solid
				color-mix(in oklab, var(--color-surface-content, currentColor) 40%, transparent);
			outline-offset: 0;
		}

		:global([popover][id^='lc-tc-scroll-menu-'][data-size='sm'] > button) {
			padding: 0.375rem 0.5rem;
			font-size: 0.8125rem;
		}
		:global([popover][id^='lc-tc-scroll-menu-'][data-size='md'] > button) {
			padding: 0.5rem 0.625rem;
			font-size: 0.875rem;
		}
		:global([popover][id^='lc-tc-scroll-menu-'][data-size='lg'] > button) {
			padding: 0.625rem 0.75rem;
			font-size: 0.9375rem;
		}

		:global([popover][id^='lc-tc-scroll-menu-'] > button svg) {
			flex-shrink: 0;
			width: 1.2em;
			height: 1.2em;
		}

		:global([popover][id^='lc-tc-scroll-menu-'] > button > span) {
			flex: 1;
		}

		:global(.lc-tc-tooltip) {
			position: fixed;
			margin: 0;
			padding: 0.25rem 0.5rem;
			border-radius: 0.25rem;
			border: 1px solid
				color-mix(in oklab, var(--color-surface-content, currentColor) 15%, transparent);
			background: color-mix(
				in oklab,
				var(--color-surface-300, light-dark(white, black)) 92%,
				transparent
			);
			backdrop-filter: blur(8px);
			color: var(--color-surface-content, currentColor);
			font-size: 0.75rem;
			white-space: nowrap;
			pointer-events: none;

			&[data-orientation='vertical'] {
				position-area: inline-start center;
				margin-inline-end: 6px;
			}
			&[data-orientation='horizontal'] {
				position-area: block-start center;
				margin-block-end: 6px;
			}
		}
	}
</style>
