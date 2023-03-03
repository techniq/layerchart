<script lang="ts">
	import { getContext } from 'svelte';

	import { motionStore } from '$lib/stores/motionStore';
	import { geoContext } from './GeoContext.svelte';

	const { width, height, padding } = getContext('LayerCake');
	const geo = geoContext();

	export let mode: 'svg' | 'projection' = 'svg';
	export let spring: boolean | Parameters<typeof motionStore>[1]['spring'] = undefined;
	export let tweened: boolean | Parameters<typeof motionStore>[1]['tweened'] = undefined;
	export let disablePointer = false;
	export let scroll: 'scale' | 'translate' | 'none' = 'none';
	export let clickDistance = 10;

	let dragging = false;
	let moved = false;

	const initialTranslate =
		mode === 'projection' ? { x: $geo.translate()[0], y: $geo.translate()[1] } : { x: 0, y: 0 };
	const translate = motionStore(initialTranslate, { spring, tweened });

	const initialScale = mode === 'projection' ? $geo.scale() : 1;
	const scale = motionStore(initialScale, { spring, tweened });
	let startPoint: { x: number; y: number } = { x: 0, y: 0 };
	let startTranslate: { x: number; y: number } = { x: 0, y: 0 };
	let svgEl: SVGSVGElement | null = null;

	export function reset() {
		$translate = initialTranslate;
		$scale = initialScale;
	}

	export function increase() {
		scaleTo(1.25, { x: $width / 2, y: $height / 2 });
	}

	export function decrease() {
		scaleTo(0.8, { x: $width / 2, y: $height / 2 });
	}

	export function translateCenter() {
		$translate = {
			x: 0,
			y: 0
		};
	}

	export function zoomTo(
		center: { x: number; y: number },
		rect?: { width: number; height: number }
	) {
		// TODO: Improve mode="projection"

		$translate = {
			x: $width / 2 - center.x,
			y: $height / 2 - center.y
		};

		if (rect) {
			$scale = $width < $height ? $width / rect.width : $height / rect.height;
		}
	}

	function onMouseDown(e: MouseEvent & { currentTarget: SVGElement }) {
		if (disablePointer) return;

		dragging = true;
		moved = false;
		svgEl = e.currentTarget.ownerSVGElement; // capture for reference in mousemove event
		startPoint = localPoint(svgEl, e);
		startTranslate = $translate;

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	function onMouseMove(e: MouseEvent) {
		if (!dragging) return;

		const endPoint = localPoint(svgEl, e);
		const deltaX = endPoint.x - startPoint.x;
		const deltaY = endPoint.y - startPoint.y;

		translate.set(
			{
				x: startTranslate.x + deltaX / (mode === 'projection' ? 1 : $scale),
				y: startTranslate.y + deltaY / (mode === 'projection' ? 1 : $scale)
			},
			spring ? { hard: true } : tweened ? { duration: 0 } : undefined
		);

		if (!moved) {
			// If dragged beyond threshold, disable click propagation
			moved = deltaX * deltaX + deltaY * deltaY > clickDistance;
		}
	}

	function onMouseUp(e: MouseEvent) {
		dragging = false;

		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);
	}

	function onClick(e: MouseEvent) {
		if (moved) {
			// Do not propagate click event to children if drag/moved.  Registered in capture phase (top-down)
			e.stopPropagation();
		}
	}

	function onDoubleClick(e) {
		if (disablePointer) return;
		const point = localPoint(svgEl, e);
		scaleTo(e.shiftKey ? 0.5 : 2, point);
	}

	function onWheel(e: WheelEvent) {
		if (scroll === 'none' || disablePointer) return;

		e.preventDefault();

		svgEl = e.currentTarget.ownerSVGElement;
		const point = (startPoint = localPoint(svgEl, e));

		// Pinch to zoom is registered as a wheel event with control key
		const pinchToZoom = e.ctrlKey;

		if (scroll === 'scale' || pinchToZoom) {
			// https://github.com/d3/d3-zoom#zoom_wheelDelta
			const scaleBy =
				-e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * (e.ctrlKey ? 10 : 1);

			scaleTo(
				Math.pow(2, scaleBy),
				point,
				spring ? { hard: true } : tweened ? { duration: 0 } : undefined
			);
		} else if (scroll === 'translate') {
			translate.update(
				(startTranslate) => ({
					x: startTranslate.x + -e.deltaX / (mode === 'projection' ? 1 : $scale),
					y: startTranslate.y + -e.deltaY / (mode === 'projection' ? 1 : $scale)
				}),
				spring ? { hard: true } : tweened ? { duration: 0 } : undefined
			);
		}
	}

	/**
	 * Apply scale and translate towards point
	 */
	function scaleTo(
		value: number,
		point: { x: number; y: number },
		options: Parameters<typeof motionStore>[1] | undefined = undefined
	) {
		const currentScale = $scale;
		const newScale = $scale * value;
		scale.set(newScale, options);

		if (mode === 'projection') {
			// Maintain center while zooming in/out
			const invertTransformPoint = {
				x: (point.x - $translate.x) / currentScale,
				y: (point.y - $translate.y) / currentScale
			};
			const newTranslate = {
				x: point.x - invertTransformPoint.x * newScale,
				y: point.y - invertTransformPoint.y * newScale
			};
			translate.set(newTranslate, options);
		}
	}

	function localPoint(svgEl: SVGSVGElement | null, e: MouseEvent) {
		if (svgEl) {
			const screenCTM = svgEl.getScreenCTM();

			let point = svgEl.createSVGPoint();
			point.x = e.clientX;
			point.y = e.clientY;
			point = point.matrixTransform(screenCTM?.inverse());

			return {
				x: point.x,
				y: point.y
			};
		} else {
			return {
				x: e.clientX,
				y: e.clientY
			};
		}
	}

	$: center = { x: $width / 2, y: $height / 2 };

	$: viewportCenter = {
		x: center.x - $translate.x,
		y: center.y - $translate.y
	};

	$: newTranslate = {
		x: $translate.x * $scale + center.x - center.x * $scale,
		y: $translate.y * $scale + center.y - center.y * $scale
	};

	$: if (mode === 'projection') {
		geo.update((geo) => {
			if ($translate) {
				// console.log({ $scale, $translate });
				geo.scale($scale).translate([$translate.x, $translate.y]);
			}
			return geo;
		});
	}

	$: transform =
		mode === 'projection' ? '' : `translate(${newTranslate.x},${newTranslate.y}) scale(${$scale})`;
</script>

<g
	on:mousewheel={onWheel}
	on:mousedown={onMouseDown}
	on:dblclick={onDoubleClick}
	on:click|capture={onClick}
	on:click
	on:keydown
	on:keyup
	on:keypress
>
	<rect
		x={-$padding.left}
		y={-$padding.top}
		width={$width + $padding.left + $padding.right}
		height={$height + $padding.top + $padding.bottom}
		fill="transparent"
	/>
	<g {transform}>
		<slot scale={$scale} {zoomTo} {reset} />
	</g>
</g>
