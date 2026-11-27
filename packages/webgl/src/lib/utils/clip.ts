import { Plane, Vector3, type Camera, type Material, type Object3D } from 'three';

/**
 * A clip shape drawn as a mask the marks inside sample (see `clipMask.ts`, loaded only when a
 * clip isn't a plain rectangle)
 */
export interface SceneClipMask {
  /** Fit the mask to `object`'s frame as `camera` sees it, for this frame */
  update(object: Object3D, camera: Camera): void;
  /** Clip `material` to the mask (it's recompiled to sample it) */
  attach(material: Material): void;
  /** Stop clipping `material` to the mask */
  detach(material: Material): void;
  /** Whether a point of its frame (`x` across, `y` down) is inside the shape */
  contains(x: number, y: number): boolean;
  dispose(): void;
}

/** A rectangle of a clip's frame, `x` across and `y` down, in the chart's pixels */
export type ClipRect = { x: number; y: number; width: number; height: number };

/** What clips a mark: the planes of its clips' rectangles, and the nearest one's mask */
export type ClipChain = {
  /** Its clips' rectangles' sides, in the scene's (world) space */
  planes: Plane[];
  /** And the plot box's */
  withPlot: Plane[];
  mask: SceneClipMask | null;
};

/** A plane every point is behind: a clip waiting for its mask draws nothing */
const NOTHING = new Plane(new Vector3(1, 0, 0), -1e12);

/**
 * A clip a `ClipPath` puts on its group (its `userData.clip`): what's in the group is drawn only
 * inside its rectangle (as clipping planes, exact and cheap) or its mask (any shape), and inside
 * any clip it's in
 */
export class SceneClip {
  disabled = false;
  rect: ClipRect | null = null;
  mask: SceneClipMask | null = null;
  /** Its mask is loading: nothing inside is drawn until it's ready */
  pending = false;
  /** Called each frame before it clips (ex. to repaint its mask from shapes that have changed) */
  refresh: (() => void) | null = null;

  readonly #chain: ClipChain = { planes: [], withPlot: [], mask: null };
  readonly #own = [new Plane(), new Plane(), new Plane(), new Plane()];

  /** What clips the marks inside, in `outer` (the clips it's in), this frame */
  chain(object: Object3D, outer: ClipChain | null, plot: Plane[], camera: Camera) {
    if (this.disabled) return outer;
    this.refresh?.();
    const chain = this.#chain;
    chain.planes.length = 0;
    if (outer) chain.planes.push(...outer.planes);
    if (this.pending) {
      chain.planes.push(NOTHING);
    } else if (this.rect) {
      // Its sides in its group's frame (chart `x` along the scene's `x`, `y` along its `z`),
      // then where that frame is in the scene
      const { x, y, width, height } = this.rect;
      const [left, right, top, bottom] = this.#own;
      left.set(left.normal.set(1, 0, 0), -Math.min(x, x + width));
      right.set(right.normal.set(-1, 0, 0), Math.max(x, x + width));
      top.set(top.normal.set(0, 0, 1), -Math.min(y, y + height));
      bottom.set(bottom.normal.set(0, 0, -1), Math.max(y, y + height));
      for (const plane of this.#own) chain.planes.push(plane.applyMatrix4(object.matrixWorld));
    }
    chain.withPlot.length = 0;
    chain.withPlot.push(...plot, ...chain.planes);
    if (this.mask && !this.pending) this.mask.update(object, camera);
    chain.mask = (this.pending ? null : this.mask) ?? outer?.mask ?? null;
    return chain;
  }

  /** Whether a point of its group's frame is drawn (inside its rectangle or mask) */
  contains(x: number, y: number) {
    if (this.disabled) return true;
    if (this.pending) return false;
    if (this.rect) {
      const { x: rx, y: ry, width, height } = this.rect;
      const inside =
        x >= Math.min(rx, rx + width) &&
        x <= Math.max(rx, rx + width) &&
        y >= Math.min(ry, ry + height) &&
        y <= Math.max(ry, ry + height);
      if (!inside) return false;
    }
    return this.mask ? this.mask.contains(x, y) : true;
  }
}

const NUMBER = String.raw`([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)`;
const RECT = new RegExp(
  String.raw`^\s*M\s*${NUMBER}[\s,]+${NUMBER}\s*h\s*${NUMBER}\s*v\s*${NUMBER}\s*h\s*${NUMBER}\s*z\s*$`,
  'i'
);

/**
 * The rectangle path data draws, if it's a plain one as `RectClipPath` draws (`M x,y h w v h h -w
 * Z`), to clip to with planes rather than a mask
 */
export function rectOf(path: string): ClipRect | null {
  const match = RECT.exec(path);
  if (!match) return null;
  const [x, y, width, height, back] = match.slice(1).map(Number);
  return back === -width ? { x, y, width, height } : null;
}

const own = (o: object, key: string) => Object.prototype.hasOwnProperty.call(o, key);

/**
 * The material to draw `object` with, clipped by `planes` and `chain`'s mask: its own, unless it
 * shares it with an object clipped otherwise this frame (ex. a label's painting, shared by the
 * planes showing the same text), when it's given a copy of its own.  Without `object` (one of a
 * mesh's several materials) it's always its own.
 */
export function clipMaterial(
  object: (Object3D & { material: Material | Material[] }) | null,
  material: Material,
  planes: Plane[] | null,
  chain: ClipChain | null,
  frame: number
) {
  let m = material;
  const data = m.userData;
  if (
    object &&
    data.lcClipFrame === frame &&
    (data.lcClipPlanes !== planes || data.lcClipChain !== chain)
  ) {
    const copy = m.clone();
    // What `clone` leaves behind: its own shader changes (before any mask's), and its `userData`
    // as it is (not copied through JSON)
    const source = (data.lcMaskOwn as Record<string, unknown> | undefined) ?? m;
    for (const key of ['onBeforeCompile', 'customProgramCacheKey'] as const) {
      if (own(source, key)) (copy as any)[key] = (source as any)[key];
    }
    copy.userData = { ...data, lcMask: undefined, lcMaskOwn: undefined, lcClipFrame: undefined };
    m.addEventListener('dispose', () => copy.dispose());
    object.material = copy;
    m = copy;
  }
  m.userData.lcClipFrame = frame;
  m.userData.lcClipPlanes = planes;
  m.userData.lcClipChain = chain;
  m.clippingPlanes = planes;
  const mask = chain?.mask ?? null;
  const current = (m.userData.lcMask as SceneClipMask | undefined) ?? null;
  if (current !== mask) {
    current?.detach(m);
    mask?.attach(m);
  }
  return m;
}

/**
 * Save a material's own shader changes (see `clipMaterial`), before a mask replaces them with its
 * own that call them
 */
export function saveOwnShader(material: Material) {
  const saved: Record<string, unknown> = {};
  for (const key of ['onBeforeCompile', 'customProgramCacheKey']) {
    if (own(material, key)) saved[key] = (material as any)[key];
  }
  material.userData.lcMaskOwn = saved;
  return saved;
}

/** Put back a material's own shader changes, as `saveOwnShader` saved them */
export function restoreOwnShader(material: Material) {
  const saved = (material.userData.lcMaskOwn ?? {}) as Record<string, unknown>;
  for (const key of ['onBeforeCompile', 'customProgramCacheKey']) {
    if (key in saved) (material as any)[key] = saved[key];
    else delete (material as any)[key];
  }
  delete material.userData.lcMaskOwn;
}

/** Whether a point in the scene on `object` is drawn, inside every clip it's in */
export function clipKeeps(object: Object3D, point: Vector3) {
  for (let o: Object3D | null = object; o; o = o.parent) {
    const clip = o.userData.clip as SceneClip | undefined;
    if (!clip) continue;
    const local = o.worldToLocal(point.clone());
    if (!clip.contains(local.x, local.z)) return false;
  }
  return true;
}
