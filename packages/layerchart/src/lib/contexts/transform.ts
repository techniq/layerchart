import { Context } from 'runed';

import {} from '$lib/components/TransformContext.svelte';
import { createDefaultTransformState, type TransformState } from '$lib/states/transform.svelte.js';

export type { TransformState } from '$lib/states/transform.svelte.js';

const _TransformContext = new Context<TransformState>('TransformContext');

export function getTransformContext() {
  return _TransformContext.getOr(createDefaultTransformState());
}

export function setTransformContext(transform: TransformState) {
  return _TransformContext.set(transform);
}
