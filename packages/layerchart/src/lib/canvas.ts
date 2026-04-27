/**
 * Canvas-only variants of layer-agnostic components.
 *
 * Each export here is a Canvas-specific implementation. Use these when you
 * know your chart only renders to Canvas and want a smaller bundle.
 *
 * The agnostic versions (e.g. `import { Circle } from 'layerchart'`) still
 * work and dispatch to these per-layer variants under the hood.
 */
export { default as Circle } from './components/Circle/Circle.canvas.svelte';
export type { CircleProps, CirclePropsWithoutHTML } from './components/Circle/Circle.shared.svelte.js';
export { default as Text } from './components/Text/Text.canvas.svelte';
export type {
  TextProps,
  TextPropsWithoutHTML,
  TextSegment,
} from './components/Text/Text.shared.svelte.js';
export { default as Rect } from './components/Rect/Rect.canvas.svelte';
export type {
  RectProps,
  RectPropsWithoutHTML,
} from './components/Rect/Rect.shared.svelte.js';
export { default as Line } from './components/Line/Line.canvas.svelte';
export type {
  LineProps,
  LinePropsWithoutHTML,
} from './components/Line/Line.shared.svelte.js';
export { default as Path } from './components/Path/Path.canvas.svelte';
export type {
  PathProps,
  PathPropsWithoutHTML,
} from './components/Path/Path.shared.svelte.js';
