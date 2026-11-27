<script lang="ts" module>
  import type { ClipMask } from '../../utils/clipMask.js';

  /** The mask's code, loaded once the first clip that isn't a plain rectangle needs it */
  let loading: Promise<typeof ClipMask> | null = null;
  function loadMask() {
    return (loading ??= import('../../utils/clipMask.js').then((m) => m.ClipMask));
  }
</script>

<script lang="ts">
  import { Group, type BufferAttribute, type Mesh } from 'three';
  import { getChartContext, type ClipPathProps } from 'layerchart';
  import { createId } from 'layerchart/utils/createId';

  import { getParent, getSceneContext, setParent } from '../../contexts/scene.svelte.js';
  import { rectOf, SceneClip } from '../../utils/clip.js';
  import ClipShapes from './ClipShapes.svelte';

  const uid = $props.id();

  let {
    id = createId('clipPath-', uid),
    useId,
    disabled = false,
    invert = false,
    path,
    clip: clipShapes,
    children,
  }: ClipPathProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();
  const outer = getParent();

  // The marks inside go in a group of its own, clipped (see `SceneClip`), where its parent's would
  const object = new Group();
  const clip = new SceneClip();
  object.userData.clip = clip;
  (outer?.object ?? scene.root).add(object);
  setParent({
    object,
    get x() {
      return outer?.x ?? 0;
    },
    get y() {
      return outer?.y ?? 0;
    },
    get opacity() {
      return outer?.opacity;
    },
  });

  const url = $derived(`url(#${id})`);

  /** Where a `clip` snippet's marks go (without a `path`), kept out of the scene */
  const source = new Group();
  /** Any SVG elements the snippet has (ex. a `<circle>`), whose shapes it clips to as well */
  let host = $state<SVGSVGElement>();
  /** Its shapes when last painted, to repaint as they change */
  let painted = '';
  function shapesKey(paths: string[]) {
    let key = paths.join('|');
    source.traverseVisible((o) => {
      const geometry = (o as Mesh).geometry;
      const position = geometry?.getAttribute('position') as BufferAttribute | undefined;
      if (position) key += `${geometry.id}:${position.version}:${geometry.index?.version ?? ''},`;
    });
    return key;
  }

  /** A plain rectangle (ex. a `RectClipPath`'s) is clipped to with planes, else with a mask */
  const rect = $derived(path && !invert ? rectOf(path) : null);
  /**
   * The shape a mask paints: inverted, the plot's rectangle with the shape cut out of it (filled
   * `evenodd`), as the core `ClipPath`'s `Canvas` and `Html` versions clip
   */
  const shape = $derived(
    path && !rect ? (invert ? `M0,0 H${ctx.width} V${ctx.height} H0 Z ${path}` : path) : null
  );

  let mask: ClipMask | null = null;
  let alive = true;

  $effect(() => {
    // Its `path`, else its `clip` snippet's shapes.  With neither (ex. only a `useId`, which only
    // SVG draws), nothing is clipped, as in a `Canvas` layer
    const fromShapes = !path && !!clipShapes;
    clip.disabled = disabled || (!path && !clipShapes);
    clip.rect = rect;
    clip.refresh = null;
    if (clip.disabled || (!shape && !fromShapes)) {
      clip.mask = null;
      clip.pending = false;
      scene.invalidate();
      return;
    }
    const rule: CanvasFillRule = invert ? 'evenodd' : 'nonzero';
    // Canvas pixels per chart pixel: sharp on a high density screen, and a little zoomed in
    const scale = 2 * Math.max(1, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
    const paint = (Mask: typeof ClipMask) => {
      mask ??= new Mask();
      const current = mask;
      if (shape) {
        current.draw(shape, rule, scale);
      } else {
        // Repainted as the snippet's marks draw (they build their meshes after they mount) and
        // change
        painted = '';
        clip.refresh = () => {
          const paths = host ? current.elementPaths(host) : [];
          const key = shapesKey(paths);
          if (key === painted) return;
          painted = key;
          current.drawShapes(source, paths, scale);
        };
      }
      clip.mask = mask;
      clip.pending = false;
      scene.invalidate();
    };
    if (mask) {
      paint(mask.constructor as typeof ClipMask);
    } else {
      clip.pending = true;
      scene.invalidate();
      loadMask().then((Mask) => {
        // Still wanted, as it is now
        if (alive && !clip.disabled && clip.pending) paint(Mask);
      });
    }
  });

  $effect(() => () => {
    alive = false;
    object.parent?.remove(object);
    mask?.dispose();
    scene.invalidate();
  });
</script>

{#if clipShapes && !path}
  <ClipShapes object={source} {id} clip={clipShapes} bind:host />
{/if}
{@render children?.({ id, url, useId })}
