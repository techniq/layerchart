import type { ChartState, ComponentNode } from '$lib/states/chart.svelte.js';

export type CaptureTarget = {
  chartState?: ChartState;
  rootNode?: ComponentNode;
};

export type SSRCapture = CaptureTarget | null;

const SSR_CAPTURE_KEY = Symbol.for('layerchart.ssr-capture');

type GlobalWithSSRCapture = typeof globalThis & {
  [SSR_CAPTURE_KEY]?: SSRCapture;
};

let _capture: SSRCapture = null;

function getGlobalCaptureStore(): GlobalWithSSRCapture {
  return globalThis as GlobalWithSSRCapture;
}

export function setSSRCapture(target: SSRCapture) {
  _capture = target;

  const globalStore = getGlobalCaptureStore();
  if (target == null) {
    delete globalStore[SSR_CAPTURE_KEY];
  } else {
    globalStore[SSR_CAPTURE_KEY] = target;
  }
}

export function getSSRCapture() {
  return getGlobalCaptureStore()[SSR_CAPTURE_KEY] ?? _capture;
}
