<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTransformContext, type TransformContextValue } from '$lib/contexts/transform.js';
	import {
		DEFAULT_SCALE,
		DEFAULT_TRANSLATE,
		type TransformMode,
		type TransformScrollMode
	} from '$lib/states/transform.svelte.js';

	type TransformContextPropsWithoutHTML = {
		mode?: TransformMode;
		processTranslate?: (
			x: number,
			y: number,
			deltaX: number,
			deltaY: number
		) => {
			x: number;
			y: number;
		};
		/**
		 * Disable pointer events including move/dragging.  Useful for `mode="canvas" but only want
		 * zoomTo() interactions
		 *
		 * @default false
		 */
		disablePointer?: boolean;

		/**
		 * A bindable reference to the transform context value.
		 *
		 * @bindable
		 */
		transformContext?: TransformContextValue;

		/**
		 * Initial scroll mode.
		 * This is set to `none` by default, but can be set to `scale` or `translate`
		 *
		 * @default 'none'
		 */
		initialScrollMode?: TransformScrollMode;

		/**
		 * Distance/threshold to consider drag vs click (disable click propagation)
		 *
		 * @default 10
		 */
		clickDistance?: number;

		/**
		 * Initial translate value
		 */
		initialTranslate?: { x: number; y: number };

		/**
		 *  Initial scale value
		 */
		initialScale?: number;

		/**
		 * A callback function that is called when the transform is applied.
		 * @param e
		 */
		onTransform?: (details: { scale: number; translate: { x: number; y: number } }) => void;

		ondragstart?: () => void;
		ondragend?: () => void;
		ref?: HTMLElement;
		children?: Snippet<[{ transformContext: TransformContextValue }]>;

		motion?: MotionProp;
	};

	type TransformContextProps = TransformContextPropsWithoutHTML &
		Without<HTMLAttributes<HTMLElement>, TransformContextPropsWithoutHTML>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { localPoint } from '@layerstack/utils';
	import { watch } from 'runed';
	import type { Without } from '$lib/utils/types.js';
	import { getChartContext } from '$lib/contexts/chart.js';
	import {
		createControlledMotion,
		createMotionTracker,
		parseMotionProp,
		type MotionProp
	} from '$lib/utils/motion.svelte.js';

	let {
		mode = 'none',
		motion,
		processTranslate = (x: number, y: number, deltaX: number, deltaY: number) => ({
			x: x + deltaX,
			y: y + deltaY
		}),
		disablePointer = false,
		initialScrollMode = 'none',
		clickDistance = 10,
		ondragend = () => {},
		ondragstart = () => {},
		onTransform = () => {},
		initialTranslate,
		initialScale,
		onwheel = () => {},
		onpointerdown = () => {},
		onpointermove = () => {},
		ontouchmove = () => {},
		onpointerup = () => {},
		ondblclick = () => {},
		onclickcapture = () => {},
		ref: refProp = $bindable(),
		children,
		class: className,
		transformContext = $bindable(),
		...restProps
	}: TransformContextProps = $props();

	let ref = $state<HTMLElement>();
	$effect.pre(() => {
		refProp = ref;
	});

	transformContext = {
		get mode() {
			return mode;
		},
		get scale() {
			return scale.current;
		},
		setScale,
		get translate() {
			return translate.current;
		},
		setTranslate,
		get dragging() {
			return dragging;
		},
		get moving() {
			return moving;
		},
		reset,
		zoomIn,
		zoomOut,
		translateCenter,
		zoomTo,
		get scrollMode() {
			return scrollMode;
		},
		setScrollMode
	};

	const ctx = getChartContext();

	let pointerDown = false;
	let dragging = $state(false);
	let scrollMode = $state<TransformScrollMode>(initialScrollMode);

	const resolvedMotion = parseMotionProp(motion);

	const translate = createControlledMotion(initialTranslate ?? DEFAULT_TRANSLATE, resolvedMotion);
	const scale = createControlledMotion(initialScale ?? DEFAULT_SCALE, resolvedMotion);

	let startPoint: { x: number; y: number } = { x: 0, y: 0 };
	let startTranslate: { x: number; y: number } = { x: 0, y: 0 };

	export function setScrollMode(mode: TransformScrollMode) {
		scrollMode = mode;
	}

	export function reset() {
		translate.target = initialTranslate ?? DEFAULT_TRANSLATE;
		scale.target = initialScale ?? DEFAULT_SCALE;
	}

	export function zoomIn() {
		scaleTo(1.25, { x: (ctx.width + ctx.padding.left) / 2, y: (ctx.height + ctx.padding.top) / 2 });
	}

	export function zoomOut() {
		scaleTo(0.8, { x: (ctx.width + ctx.padding.left) / 2, y: (ctx.height + ctx.padding.top) / 2 });
	}

	export function translateCenter() {
		translate.target = {
			x: 0,
			y: 0
		};
	}

	export function zoomTo(
		center: { x: number; y: number },
		rect?: { width: number; height: number }
	) {
		const newScale = rect
			? ctx.width < ctx.height
				? ctx.width / rect.width
				: ctx.height / rect.height
			: 1;

		translate.target = {
			x: ctx.width / 2 - center.x * newScale,
			y: ctx.height / 2 - center.y * newScale
		};

		if (rect) {
			scale.target = newScale;
		}
	}

	function onPointerDown(e: PointerEvent & { currentTarget: HTMLElement }) {
		onpointerdown?.(e);
		if (mode === 'none' || disablePointer) return;

		e.preventDefault();

		pointerDown = true;
		dragging = false;
		startPoint = localPoint(e);
		startTranslate = translate.current;

		ondragstart?.();
	}

	function onPointerMove(e: PointerEvent & { currentTarget: HTMLElement }) {
		onpointermove?.(e);
		if (!pointerDown) return;

		e.preventDefault(); // Stop text selection

		const endPoint = localPoint(e);
		const deltaX = endPoint.x - startPoint.x;
		const deltaY = endPoint.y - startPoint.y;

		if (!dragging) {
			// If dragged beyond threshold, disable click propagation
			dragging = deltaX * deltaX + deltaY * deltaY > clickDistance;
		}

		if (dragging) {
			e.stopPropagation(); // Stop tooltip from trigging (along with `capture: true`)
			e.currentTarget?.setPointerCapture(e.pointerId);

			setTranslate(
				processTranslate(startTranslate.x, startTranslate.y, deltaX, deltaY),
				translate.type === 'spring'
					? { instant: true }
					: translate.type === 'tween'
						? { duration: 0 }
						: undefined
			);
		}
	}

	function onPointerUp(e: PointerEvent & { currentTarget: HTMLElement }) {
		onpointerup?.(e);
		pointerDown = false;
		dragging = false;
		ondragend?.();
	}

	function onClick(e: MouseEvent & { currentTarget: HTMLElement }) {
		onclickcapture?.(e);
		if (dragging) {
			// Do not propagate click event to children if drag/moved.  Registered in capture phase (top-down)
			e.stopPropagation();
		}
	}

	function onDoubleClick(e: MouseEvent & { currentTarget: HTMLElement }) {
		ondblclick?.(e);
		if (mode === 'none' || disablePointer) return;
		const point = localPoint(e);
		scaleTo(e.shiftKey ? 0.5 : 2, point);
	}

	function onWheel(e: WheelEvent & { currentTarget: HTMLElement }) {
		onwheel?.(e);
		if (mode === 'none' || disablePointer || scrollMode === 'none') return;

		e.preventDefault();

		const point = (startPoint = localPoint(e));

		// Pinch to zoom is registered as a wheel event with control key
		const pinchToZoom = e.ctrlKey;

		if (scrollMode === 'scale' || pinchToZoom) {
			// https://github.com/d3/d3-zoom#zoom_wheelDelta
			const scaleBy =
				-e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * (e.ctrlKey ? 10 : 1);

			scaleTo(
				Math.pow(2, scaleBy),
				point,
				scale.type === 'spring'
					? { instant: true }
					: scale.type === 'tween'
						? { duration: 0 }
						: undefined
			);
		} else if (scrollMode === 'translate') {
			const startTranslate = translate.current;
			translate
				.set(
					processTranslate(startTranslate.x, startTranslate.y, -e.deltaX, -e.deltaY),
					translate.type === 'spring'
						? { instant: true }
						: translate.type === 'tween'
							? { duration: 0 }
							: undefined
				)
				.then(() => {})
				.catch(() => {});
		}
	}

	/**
	 * Apply scale and translate towards point
	 */
	function scaleTo(
		value: number,
		point: { x: number; y: number },
		options: Parameters<(typeof scale)['set']>[1] | undefined = undefined
	) {
		const currentScale = scale.current;
		const newScale = scale.current * value;
		setScale(newScale, options);

		// Translate towards point (ex. mouse cursor/center) while zooming in/out
		const invertTransformPoint = {
			x: (point.x - ctx.padding.left - translate.current.x) / currentScale,
			y: (point.y - ctx.padding.top - translate.current.y) / currentScale
		};
		const newTranslate = {
			x: point.x - ctx.padding.left - invertTransformPoint.x * newScale,
			y: point.y - ctx.padding.top - invertTransformPoint.y * newScale
		};
		setTranslate(newTranslate, options);
	}

	const translating = createMotionTracker();
	const scaling = createMotionTracker();

	const moving = $derived(dragging || translating.current || scaling.current);

	export function setTranslate(
		point: { x: number; y: number },
		options?: Parameters<(typeof translate)['set']>[1]
	) {
		translating.handle(translate.set(point, options));
	}

	export function setScale(value: number, options?: MotionProp) {
		scaling.handle(scale.set(value, options));
	}

	watch([() => scale.current, () => translate.current], () => {
		onTransform({
			scale: scale.current,
			translate: translate.current
		});
	});

	setTransformContext(transformContext);
</script>

<div
	onwheel={onWheel}
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	ontouchmove={(e) => {
		ontouchmove?.(e);
		// Touch events cause pointer events to be interrupted.
		// Typically `touch-action: none` works, but doesn't appear to with SVG, but `preventDefault()` works here
		// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#touch-action_css_property
		if (mode !== 'none' && !disablePointer) {
			e.preventDefault();
		}
	}}
	onpointerup={onPointerUp}
	ondblclick={onDoubleClick}
	onclickcapture={onClick}
	class={['lc-transform-context', className]}
	bind:this={ref}
	{...restProps}
>
	{@render children?.({ transformContext: transformContext })}
</div>

<style>
	@layer base {
		:where(.lc-transform-context) {
			height: 100%;
		}
	}
</style>
