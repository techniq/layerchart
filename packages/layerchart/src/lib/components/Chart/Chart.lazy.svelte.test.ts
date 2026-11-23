import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { flushSync } from 'svelte';

import LazyChartsHarness from '$lib/tests/LazyChartsHarness.svelte';

const built = (i: number) =>
  document.querySelector(`[data-chart="${i}"] .lc-root-container svg`) != null;
const placeholderShown = (i: number) =>
  document.querySelector(`[data-chart="${i}"] .lc-root-container .placeholder`) != null;

describe('Chart lazy', () => {
  // Tests scroll the page — start each at the top, where chart 0 is on screen
  beforeEach(() => window.scrollTo(0, 0));

  it('builds on-screen charts in the first flush and defers the rest', () => {
    render(LazyChartsHarness, { count: 20, lazy: true });
    flushSync();
    expect(built(0)).toBe(true);
    expect(built(19)).toBe(false);
    // The container is still laid out, so the page doesn't shift once it builds
    const container = document.querySelector('[data-chart="19"] .lc-root-container')!;
    expect(container.getBoundingClientRect().height).toBe(300);
  });

  it('builds a chart once it scrolls near the viewport, and keeps it', async () => {
    render(LazyChartsHarness, { count: 20, lazy: true });
    document.querySelector('[data-chart="19"]')!.scrollIntoView();
    await expect.poll(() => built(19)).toBe(true);
    window.scrollTo(0, 0);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    expect(built(19)).toBe(true);
  });

  it('builds everything when not lazy', () => {
    render(LazyChartsHarness, { count: 20, lazy: false });
    flushSync();
    expect(built(19)).toBe(true);
  });

  it('renders the placeholder until the chart is built', async () => {
    render(LazyChartsHarness, { count: 20, lazy: true });
    flushSync();
    expect(placeholderShown(0)).toBe(false);
    expect(placeholderShown(19)).toBe(true);
    document.querySelector('[data-chart="19"]')!.scrollIntoView();
    await expect.poll(() => built(19)).toBe(true);
    expect(placeholderShown(19)).toBe(false);
  });

  it('defaults to the `lazy` setting', () => {
    render(LazyChartsHarness, { count: 20, settingsLazy: true });
    flushSync();
    expect(built(0)).toBe(true);
    expect(built(19)).toBe(false);
  });

  it('lets a chart opt out of the `lazy` setting', () => {
    render(LazyChartsHarness, { count: 20, settingsLazy: true, lazy: false });
    flushSync();
    expect(built(19)).toBe(true);
  });
});
