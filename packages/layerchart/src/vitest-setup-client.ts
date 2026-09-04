/// <reference types="vitest/browser" />
/// <reference types="@vitest/browser-playwright" />

import { afterEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

/**
 * Park the cursor back on `body` between tests.
 *
 * Browser mode tiles every test file's iframe into one page sharing a single cursor, so a `hover()`
 * leaves it sitting wherever that test put it — including over the space where the *next* test's
 * chart mounts.  The browser fires a boundary event when an element appears under a stationary
 * cursor, which shows a tooltip, highlights a point, or resolves a facet panel that the test never
 * asked for.  It fails whichever assertion reads that state, in a different test each run.
 *
 * Leaving the cursor where the last test dropped it is the leak; this returns it to a neutral spot,
 * the same way `cleanup()` returns the DOM to one.
 */
afterEach(async () => {
  // Moving the cursor is a round trip to the browser driver, and it costs about as much as a small
  // test.  Only five of these files ever move it, so skip the trip unless `:hover` says the cursor
  // is actually resting on something — the DOM is still up here, this hook running before the
  // render is torn down.
  const hovered = document.querySelectorAll(':hover');
  const deepest = hovered[hovered.length - 1];
  if (deepest && deepest !== document.documentElement && deepest !== document.body) {
    await userEvent.unhover(document.body);
  }
});

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
