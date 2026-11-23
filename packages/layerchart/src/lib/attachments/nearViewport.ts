import type { Attachment } from 'svelte/attachments';

export type NearViewportOptions = {
  /** How far outside the viewport counts as near, as a CSS margin.  Defaults to `'200px'`. */
  rootMargin?: string;
  /** Passed to the `IntersectionObserver` */
  threshold?: number | number[];
};

/** Reports waiting their turn, oldest first */
const queue: Array<() => void> = [];
let draining = false;
/** Whether a report has already run in the current task */
let reportedThisTask = false;

/**
 * Run `report` now if it's the first in this task, else after the reports queued before it, one
 * per idle period.  Whatever a report reveals (ex. a chart) is built in the same task, so this
 * keeps many elements arriving together — every chart on screen at load, or a fast scroll past a
 * dozen — from building in one long task that blocks input and scrolling.
 */
function schedule(report: () => void) {
  if (!reportedThisTask && !draining) {
    reportedThisTask = true;
    setTimeout(() => (reportedThisTask = false));
    report();
    return;
  }
  queue.push(report);
  if (!draining) {
    draining = true;
    idle(drain);
  }
}

function drain() {
  const report = queue.shift();
  if (!report) {
    draining = false;
    return;
  }
  report();
  idle(drain);
}

function idle(callback: () => void) {
  if (typeof requestIdleCallback === 'function') requestIdleCallback(callback, { timeout: 200 });
  else setTimeout(callback, 16);
}

/**
 * Calls `onNear` once, with the element, when it's on screen or comes within `rootMargin` of it.
 *
 * An element already on screen is reported as it attaches, rather than at the observer's first
 * (asynchronous) report, so the first one on a page paints in its first frame.  Elements attaching
 * together all read their position before any of them reacts, so the browser lays out once for all
 * of them.  A hidden element (no box) waits for the observer, and so is reported when it's shown.
 *
 * Only the first report in a task runs immediately; the rest follow one per idle period (see
 * `schedule`).  A report still waiting when the element detaches is dropped.
 */
export function nearViewport(
  onNear: (node: HTMLElement) => void,
  options: NearViewportOptions = {}
): Attachment<HTMLElement> {
  return (node) => {
    let attached = true;
    const report = () => schedule(() => attached && onNear(node));

    const rect = node.getBoundingClientRect();
    if (
      (rect.width > 0 || rect.height > 0) &&
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= window.innerHeight &&
      rect.left <= window.innerWidth
    ) {
      report();
      return () => (attached = false);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          report();
        }
      },
      { rootMargin: options.rootMargin ?? '200px', threshold: options.threshold }
    );
    observer.observe(node);
    return () => {
      attached = false;
      observer.disconnect();
    };
  };
}
