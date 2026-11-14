import type { Attachment } from 'svelte/attachments';

export type NearViewportOptions = {
  /** How far outside the viewport counts as near, as a CSS margin.  Defaults to `'200px'`. */
  rootMargin?: string;
  /** Passed to the `IntersectionObserver` */
  threshold?: number | number[];
};

/**
 * Calls `onNear` once, with the element, when it's on screen or comes within `rootMargin` of it.
 *
 * An element already on screen is reported immediately, in the same flush it attaches in, rather
 * than at the observer's first (asynchronous) report — so whatever it reveals doesn't paint empty
 * for a frame.  Elements attaching together all read their position before any of them reacts, so
 * the browser lays out once for all of them.  A hidden element (no box) waits for the observer, and
 * so is reported when it's shown.
 */
export function nearViewport(
  onNear: (node: HTMLElement) => void,
  options: NearViewportOptions = {}
): Attachment<HTMLElement> {
  return (node) => {
    const rect = node.getBoundingClientRect();
    if (
      (rect.width > 0 || rect.height > 0) &&
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= window.innerHeight &&
      rect.left <= window.innerWidth
    ) {
      onNear(node);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          onNear(node);
        }
      },
      { rootMargin: options.rootMargin ?? '200px', threshold: options.threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  };
}
