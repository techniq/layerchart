// Everything a 3D chart needs from one import: the chart itself and the pieces that draw outside
// the scene come from `layerchart`, and the marks drawn in it from here.
export { Chart, Legend, Tooltip } from 'layerchart';

export { default as Scene } from './components/Scene/Scene.svelte';
export type { SceneProps, ScenePropsWithoutHTML } from './components/Scene/Scene.svelte';
export { default as Axis } from './components/Axis/Axis.svelte';
export type { AxisProps } from './components/Axis/Axis.svelte';
export { default as Bars } from './components/Bars/Bars.svelte';
export type { BarsProps } from './components/Bars/Bars.svelte';
export { default as Grid } from './components/Grid/Grid.svelte';
export type { GridProps } from './components/Grid/Grid.svelte';
export { default as Points } from './components/Points/Points.svelte';
export type { PointsProps } from './components/Points/Points.svelte';
export { default as Spline } from './components/Spline/Spline.svelte';
export type { SplineProps } from './components/Spline/Spline.svelte';

export { getSceneContext, SceneState } from './contexts/scene.svelte.js';
export type { Pickable, SceneLabel, Side } from './contexts/scene.svelte.js';
