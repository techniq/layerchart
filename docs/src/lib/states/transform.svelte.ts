import type { TransformContextValue } from '$lib/contexts/transform.js';

export type TransformMode = 'canvas' | 'manual' | 'none';
export type TransformScrollMode = 'scale' | 'translate' | 'none';

export const DEFAULT_TRANSLATE = { x: 0, y: 0 };
export const DEFAULT_SCALE = 1;

export function createDefaultTransformContext() {
	let defaultTranslate = $state(DEFAULT_TRANSLATE);
	let defaultScale = $state(DEFAULT_SCALE);

	const defaultContext: TransformContextValue = {
		mode: 'none',
		get scale() {
			return defaultScale;
		},
		setScale: (value: number) => {
			defaultScale = value;
		},
		get translate() {
			return defaultTranslate;
		},
		setTranslate: (value: { x: 0; y: 0 }) => {
			defaultTranslate = value;
		},
		moving: false,
		dragging: false,
		scrollMode: 'none',
		setScrollMode: () => {},
		reset: () => {},
		zoomIn: () => {},
		zoomOut: () => {},
		translateCenter: () => {},
		zoomTo: () => {}
	};

	return defaultContext;
}
