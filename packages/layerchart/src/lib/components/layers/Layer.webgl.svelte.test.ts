import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import WebGLSetting from './__fixtures__/WebGLSetting.svelte';

describe('Layer with `settings.layer="webgl"`', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  afterEach(() => warn.mockClear());

  it('draws a `<Layer>` with no `type` as `canvas`, and warns once', async () => {
    const { container } = render(WebGLSetting, { mode: 'children' });
    await expect.poll(() => container.querySelector('canvas')).not.toBeNull();
    expect(container.querySelector('svg')).toBeNull();

    render(WebGLSetting, { mode: 'children' });
    const fallbackWarnings = () =>
      warn.mock.calls.filter(([message]) => String(message).includes('draws `webgl` as `canvas`'));
    await expect.poll(() => fallbackWarnings().length).toBe(1);
  });

  it('draws a chart from its props as `canvas`', async () => {
    const { container } = render(WebGLSetting, { mode: 'props' });
    await expect.poll(() => container.querySelector('canvas')).not.toBeNull();
    expect(container.querySelector('svg circle')).toBeNull();
  });
});
