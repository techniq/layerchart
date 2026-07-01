type MovableOptions = {
	/**
	 * Number of pixels to step
	 */
	step?: number;

	/**
	 * Percentage of parent element's pixels to step
	 */
	stepPercent?: number;

	axis?: 'x' | 'y' | 'xy';

	onMoveStart?: (opts: { x: number; y: number }) => void;
	onMove?: (opts: { x: number; y: number; dx: number; dy: number }) => void;
	onMoveEnd?: (opts: { x: number; y: number }) => void;
};

export function movable(options: MovableOptions = {}) {
	return (node: HTMLElement | SVGElement) => {
		let lastX = 0;
		let lastY = 0;
		let moved = false;

		function onMouseDown(event: MouseEvent) {
			lastX = event.clientX;
			lastY = event.clientY;
			moved = false;

			options?.onMoveStart?.({ x: lastX, y: lastY });

			window.addEventListener('mousemove', onMouseMove);
			window.addEventListener('mouseup', onMouseUp);
		}
		(node as HTMLElement).addEventListener('mousedown', onMouseDown);

		function onMouseMove(event: MouseEvent) {
			moved = true;

			// TODO: Handle page scroll?  clientX/Y is based on viewport (apply to parent?)
			let dx = event.clientX - lastX;
			let dy = event.clientY - lastY;

			const xEnabled = options?.axis?.includes('x') ?? true;
			const yEnabled = options?.axis?.includes('y') ?? true;

			if (options.step) {
				if (Math.abs(dx) >= options.step) {
					const overStep = dx % options.step;
					dx = dx - overStep;
					lastX = event.clientX - overStep;
				} else {
					dx = 0;
				}

				if (Math.abs(dy) >= options.step) {
					const overStep = dy % options.step;
					dy = dy - overStep;
					lastY = event.clientY - overStep;
				} else {
					dy = 0;
				}
			} else if (options.stepPercent) {
				const parentWidth = node.parentElement?.offsetWidth ?? 0;
				const parentHeight = node.parentElement?.offsetHeight ?? 0;

				if (Math.abs(dx / parentWidth) >= options.stepPercent) {
					const overStep = dx % (parentWidth * options.stepPercent);
					dx = dx - overStep;
					lastX = event.clientX - overStep;
				} else {
					dx = 0;
				}

				if (Math.abs(dy / parentHeight) >= options.stepPercent) {
					const overStep = dy % (parentHeight * options.stepPercent);
					dy = dy - overStep;
					lastY = event.clientY - overStep;
				} else {
					dy = 0;
				}
			} else {
				lastX = event.clientX;
				lastY = event.clientY;
			}

			if ((xEnabled && dx) || (yEnabled && dy)) {
				options.onMove?.({ x: lastX, y: lastX, dx: xEnabled ? dx : 0, dy: yEnabled ? dy : 0 });
			} else {
				// Not enough change
			}
		}

		function onMouseUp(event: MouseEvent) {
			lastX = event.clientX;
			lastY = event.clientY;

			options.onMoveEnd?.({ x: lastX, y: lastY });

			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		}

		function onClick(event: MouseEvent) {
			if (moved) {
				event.stopImmediatePropagation();
			}
		}
		(node as HTMLElement).addEventListener('click', onClick);

		return () => {
			(node as HTMLElement).removeEventListener('mousedown', onMouseDown);
			(node as HTMLElement).removeEventListener('click', onClick);
		};
	};
}
