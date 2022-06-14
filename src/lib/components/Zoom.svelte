<script lang="ts">
	import { getContext } from 'svelte';

	import { motionStore } from '$lib/stores/motionStore';

	const { width, height, padding } = getContext('LayerCake');

	export let spring: boolean | Parameters<typeof motionStore>[1]['spring'] = undefined;
	export let tweened: boolean | Parameters<typeof motionStore>[1]['tweened'] = undefined;

	let dragging = false;

	const translate = motionStore({ x: 0, y: 0 }, { spring, tweened });
	const scale = motionStore({ x: 1, y: 1 }, { spring, tweened });
	let startPoint;
	let startTranslate;
	let svgEl = null;

	export function reset() {
		$translate = { x: 0, y: 0 };
		$scale = { x: 1, y: 1 };
	}

	export function increase() {
		$scale = {
			x: $scale.x * 1.25,
			y: $scale.y * 1.25
		};
	}

	export function decrease() {
		$scale = {
			x: $scale.x * 0.8,
			y: $scale.y * 0.8
		};
	}

	export function translateCenter() {
		$translate = {
			x: 0,
			y: 0
		};
	}

	function handleMouseDown(e) {
		dragging = true;
		svgEl = e.target.ownerSVGElement;
		startPoint = localPoint(svgEl, e);
		startTranslate = $translate;

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseUp(e) {
		dragging = false;

		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(e) {
		if (!dragging) return;

		const endPoint = localPoint(svgEl, e);
		const deltaX = endPoint.x - startPoint.x;
		const deltaY = endPoint.y - startPoint.y;

		translate.set(
			{
				x: startTranslate.x + deltaX / $scale.x,
				y: startTranslate.y + deltaY / $scale.y
			},
			{ hard: true }
		);
	}

	function handleDoubleClick() {
		increase();
	}

	function handleWheel(e) {
		e.preventDefault();
		const scaleBy = -e.deltaY > 0 ? 1.1 : 0.9;

		// TODO: Update to match d3-zoom delta
		// https://github.com/d3/d3-zoom#zoom_wheelDelta
		// const scaleBy = -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002);

		scale.set(
			{
				x: $scale.x * scaleBy,
				y: $scale.y * scaleBy
			},
			{ hard: true }
		);
	}

	function localPoint(svgEl, e) {
		const screenCTM = svgEl.getScreenCTM();

		const coords = {
			x: e.clientX,
			y: e.clientY
		};

		let point = svgEl.createSVGPoint();
		point.x = coords.x;
		point.y = coords.y;
		point = point.matrixTransform(screenCTM.inverse());

		return {
			x: point.x,
			y: point.y
		};
	}

	$: center = { x: $width / 2, y: $height / 2 };

	$: viewportCenter = {
		x: center.x - $translate.x,
		y: center.y - $translate.y
	};

	$: newTranslate = {
		x: $translate.x * $scale.x + center.x - center.x * $scale.x,
		y: $translate.y * $scale.y + center.y - center.y * $scale.y
	};
</script>

<rect
	x={-$padding.left}
	y={-$padding.top}
	width={$width + $padding.left + $padding.right}
	height={$height + $padding.top + $padding.bottom}
	on:mousewheel={handleWheel}
	on:mousedown={handleMouseDown}
	on:dblclick={handleDoubleClick}
	fill="transparent"
/>
<g transform="translate({newTranslate.x},{newTranslate.y}) scale({$scale.x},{$scale.y})">
	<slot />
</g>
