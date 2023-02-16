<script lang="ts">
	import { getContext } from 'svelte';

	import { motionStore } from '$lib/stores/motionStore';

	const { width, height, padding } = getContext('LayerCake');

	export let spring: boolean | Parameters<typeof motionStore>[1]['spring'] = undefined;
	export let tweened: boolean | Parameters<typeof motionStore>[1]['tweened'] = undefined;
	export let disablePointer = false;
	export let scroll: 'scale' | 'translate' | 'none' = 'none';
	export let clickDistance = 10;

	let dragging = false;
	let moved = false;

	const translate = motionStore({ x: 0, y: 0 }, { spring, tweened });
	const scale = motionStore(1, { spring, tweened });
	let startPoint: { x: number; y: number } = { x: 0, y: 0 };
	let startTranslate: { x: number; y: number } = { x: 0, y: 0 };
	let svgEl: SVGSVGElement | null = null;

	export function reset() {
		$translate = { x: 0, y: 0 };
		$scale = 1;
	}

	export function increase() {
		$scale *= 1.25;
	}

	export function decrease() {
		$scale *= 0.8;
	}

	export function translateCenter() {
		$translate = {
			x: 0,
			y: 0
		};
	}

	export function zoomTo(newTranslate: { x: number; y: number }, newScale?: number) {
		$translate = {
			x: $width / 2 - newTranslate.x,
			y: $height / 2 - newTranslate.y
		};

		if (newScale) {
			$scale = Math.min($width, $height) / newScale;
		}
	}

	function handleMouseDown(e: MouseEvent & { currentTarget: SVGElement }) {
		if (disablePointer) return;

		dragging = true;
		moved = false;
		svgEl = e.currentTarget.ownerSVGElement;
		startPoint = localPoint(svgEl, e);
		startTranslate = $translate;

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!dragging) return;

		const endPoint = localPoint(svgEl, e);
		const deltaX = endPoint.x - startPoint.x;
		const deltaY = endPoint.y - startPoint.y;

		translate.set(
			{
				x: startTranslate.x + deltaX / $scale,
				y: startTranslate.y + deltaY / $scale
			},
			spring ? { hard: true } : tweened ? { duration: 0 } : undefined
		);

		if (!moved) {
			// If dragged beyond threshold, disable click propagation
			moved = deltaX * deltaX + deltaY * deltaY > clickDistance;
		}
	}

	function handleMouseUp(e: MouseEvent) {
		dragging = false;

		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
	}

	function handleClick(e: MouseEvent) {
		if (moved) {
			// Do not propagate click event to children if drag/moved.  Registered in capture phase (top-down)
			e.stopPropagation();
		}
	}

	function handleDoubleClick() {
		if (disablePointer) return;
		increase();
	}

	function handleWheel(e: WheelEvent) {
		if (scroll === 'none' || disablePointer) return;

		e.preventDefault();

		if (scroll === 'scale') {
			// https://github.com/d3/d3-zoom#zoom_wheelDelta
			const scaleBy =
				-e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * (e.ctrlKey ? 10 : 1);

			scale.set(
				$scale * Math.pow(2, scaleBy),
				spring ? { hard: true } : tweened ? { duration: 0 } : undefined
			);
		} else if (scroll === 'translate') {
			translate.update(
				(startTranslate) => ({
					x: startTranslate.x + -e.deltaX / $scale,
					y: startTranslate.y + -e.deltaY / $scale
				}),
				spring ? { hard: true } : tweened ? { duration: 0 } : undefined
			);
		}
	}

	function localPoint(svgEl: SVGSVGElement | null, e: MouseEvent) {
		if (svgEl) {
			const screenCTM = svgEl.getScreenCTM();

			const coords = {
				x: e.clientX,
				y: e.clientY
			};

			let point = svgEl.createSVGPoint();
			point.x = coords.x;
			point.y = coords.y;
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
</script>

<g
	on:mousewheel={handleWheel}
	on:mousedown={handleMouseDown}
	on:dblclick={handleDoubleClick}
	on:click|capture={handleClick}
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
	<g transform="translate({newTranslate.x},{newTranslate.y}) scale({$scale})">
		<slot scale={$scale} {zoomTo} />
	</g>
</g>
