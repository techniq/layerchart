/**
 * HTML-only variants of layer-agnostic components.
 *
 * Each export here is an HTML-specific implementation. Use these when you
 * know your chart only renders to the HTML layer and want a smaller bundle.
 *
 * The agnostic versions (e.g. `import { Circle } from 'layerchart'`) still
 * work and dispatch to these per-layer variants under the hood.
 */
export { default as Circle } from './components/Circle.html.svelte';
export type { CircleProps, CirclePropsWithoutHTML } from './components/Circle.shared.svelte.js';
