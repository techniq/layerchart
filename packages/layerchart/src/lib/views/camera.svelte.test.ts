import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TooltipTestHarness from '$lib/tests/TooltipTestHarness.svelte';
import { isometric } from '$lib/views/isometric.js';
import { orthographic, perspective } from '$lib/views/camera.js';

// Its own file: the warning shows once a page, so another test's 3D view mustn't have shown it
describe('a flat layer under a camera view', () => {
  it('warns once that it draws flat, and not under no view or `isometric`', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chart = (view: unknown) =>
      render(TooltipTestHarness, {
        chartProps: { data: [{ x: 1, y: 1 }], x: 'x', y: 'y', width: 200, height: 150, view },
      });
    const flatWarnings = () =>
      warn.mock.calls.filter(([message]) => String(message).includes("can't draw through"));

    chart(undefined);
    chart(isometric);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(flatWarnings()).toHaveLength(0);

    chart(perspective());
    await vi.waitFor(() => expect(flatWarnings()).toHaveLength(1));
    expect(String(flatWarnings()[0][0])).toContain('`perspective` view');

    chart(orthographic());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(flatWarnings()).toHaveLength(1);
    warn.mockRestore();
  });
});
