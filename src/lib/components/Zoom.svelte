<script lang="ts">
	import { getContext } from 'svelte';

	const { width, height, padding } = getContext('LayerCake');

	let dragging = false;

	let translate = { x: 0, y: 0 };
	let scale = { x: 1, y: 1 };
	let startPoint;
	let startTranslate;
	let svgEl = null;

	export function reset() {
		translate = { x: 0, y: 0 };
		scale = { x: 1, y: 1 };
	}

	export function increase() {
		scale = {
			x: scale.x * 1.25,
			y: scale.y * 1.25
		};
	}

	export function decrease() {
		scale = {
			x: scale.x * 0.8,
			y: scale.y * 0.8
		};
	}

	export function translateCenter() {
		translate = {
			x: 0,
			y: 0
		};
	}

	function handleMouseDown(e) {
		dragging = true;
		svgEl = e.target.ownerSVGElement;
		startPoint = localPoint(svgEl, e);
		startTranslate = translate;

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

		translate = {
			x: startTranslate.x + deltaX / scale.x,
			y: startTranslate.y + deltaY / scale.y
		};
	}

	function handleDoubleClick() {
		increase();
	}

	function handleWheel(e) {
		e.preventDefault();
		const scaleBy = e.deltaY > 0 ? 1.1 : 0.9;
		scale = {
			x: scale.x * scaleBy,
			y: scale.y * scaleBy
		};
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
		x: center.x - translate.x,
		y: center.y - translate.y
	};

	$: newTranslate = {
		x: translate.x * scale.x + center.x - center.x * scale.x,
		y: translate.y * scale.y + center.y - center.y * scale.y
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
<g transform="translate({newTranslate.x},{newTranslate.y}) scale({scale.x},{scale.y})">
	<slot />
</g>
