/// <reference types="vitest/browser" />
/// <reference types="@vitest/browser-playwright" />

import { vi } from 'vitest';

/**
 * `vi.waitFor` defaults to a 1s timeout, and unlike `expect.poll` it has no global setting.
 *
 * These tests are real browser renders, and the suite waits on them in ~160 places without ever
 * passing a timeout.  Under CPU contention — a docs sweep running alongside, or a small CI runner
 * — a chart can take longer than a second to settle, and any of those waits then reports a
 * perfectly healthy render as a failure.  The symptom is a different test failing on each run.
 *
 * Raising the default only changes how long a genuine failure takes to surface.  Individual calls
 * can still pass their own timeout.
 */
const waitFor = vi.waitFor;
vi.waitFor = ((callback: Parameters<typeof waitFor>[0], options?: Parameters<typeof waitFor>[1]) =>
  waitFor(
    callback,
    typeof options === 'number' ? options : { timeout: 5000, ...options }
  )) as typeof vi.waitFor;
