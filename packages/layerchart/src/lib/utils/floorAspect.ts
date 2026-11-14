/**
 * A view's floor proportions, shared by the `isometric` view and the camera views (`perspective`,
 * `orthographic`).  Its own module, so the camera views get it without bundling the isometric view.
 */

/** How far apart a continuous axis' ends may sit before `'auto'` gives up on equal units */
const MAX_AUTO_ASPECT = 4;

/**
 * The floor's proportions for `aspect: 'auto'`: columns over rows for two band scales, the
 * domains' spans for two continuous ones (square when that would leave a sliver), else square.
 */
export function autoFloorAspect(
  x: { scale: unknown; domain: unknown[] },
  y: { scale: unknown; domain: unknown[] }
) {
  const isBand = (scale: unknown) => typeof (scale as any)?.bandwidth === 'function';
  if (isBand(x.scale) && isBand(y.scale)) {
    return x.domain.length > 0 && y.domain.length > 0 ? x.domain.length / y.domain.length : 1;
  }

  const span = (domain: unknown[]) => {
    const [d0, d1] = [domain[0], domain[domain.length - 1]];
    return typeof d0 === 'number' && typeof d1 === 'number' ? Math.abs(d1 - d0) : NaN;
  };
  const ratio = span(x.domain) / span(y.domain);
  if (!Number.isFinite(ratio) || ratio <= 0) return 1;
  return ratio > MAX_AUTO_ASPECT || ratio < 1 / MAX_AUTO_ASPECT ? 1 : ratio;
}
