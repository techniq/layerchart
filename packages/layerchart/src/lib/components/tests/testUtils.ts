import type { Component } from 'svelte';
import { flushSync } from 'svelte';
import { expect } from 'vitest';
import Svg from '../layers/Svg.svelte';
import Canvas from '../layers/Canvas.svelte';
import Html from '../layers/Html.svelte';

const layerComponents: Record<string, Component<any>> = {
  svg: Svg,
  canvas: Canvas,
  html: Html,
};

/**
 * Assert component exists in container and return element reference.
 *
 * @param container - The container element to query
 * @param componentSelector - CSS selector for the component element
 * @returns element
 */
export function assertComponent(container: HTMLElement, componentSelector: string): Element | null {
  flushSync();
  const componentRef = container.querySelector(componentSelector);
  expect(componentRef).toBeTruthy();
  return componentRef as HTMLElement;
}

/**
 * Create layer configurations from a list of layer names.
 *
 * @param layerNames - Array of layer names (e.g., ['svg', 'canvas'])
 */
export function createLayers(layerNames: Array<'svg' | 'canvas' | 'html'>): Array<{
  name: string;
  layer: Component<any>;
}> {
  return layerNames
    .filter((layerName: 'svg' | 'canvas' | 'html') => layerComponents[layerName])
    .map((layerName: 'svg' | 'canvas' | 'html') => ({
      name: layerName.charAt(0).toUpperCase() + layerName.slice(1),
      layer: layerComponents[layerName],
    }));
}
