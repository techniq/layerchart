<script lang="ts">
  import { untrack } from 'svelte';
  import { ShapeGeometry, ShapePath } from 'three';
  import type { GeoBinProps } from 'layerchart/geo';
  import { BinBase, sphereBinning } from 'layerchart/base';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { createMerged } from '../../utils/merged.svelte.js';
  import { parsePath } from '../../utils/path.js';
  import type { ClassStyle } from '../../utils/color.js';
  import Group from '../Group/Group.svelte';
  import ChartClipPath from '../ChartClipPath/ChartClipPath.svelte';
  import Path from '../Path/Path.svelte';
  import GeoBinPath from './GeoBin.path.svelte';
  import { setBinPaths, type BinPath, type BinPaths } from './GeoBin.cells.js';

  let props: GeoBinProps = $props();

  const scene = getSceneContext();

  /**
   * Raised into columns, each drawn as a `Path` of its own, so nearer ones cover farther ones (and
   * their outlines) in the order they're drawn, as SVG paints them.  Flat cells don't overlap, so
   * they're drawn together.
   */
  const columns = untrack(() => props.z) != null;

  /** Its cells' paths, drawn together */
  let version = $state(0);
  const paths: BinPaths = {
    list: [],
    get version() {
      return version;
    },
    bump: () => version++,
  };
  setBinPaths(paths);

  /** Whether any cell takes the pointer (else none is picked, so the pointer costs nothing) */
  const handled = $derived(
    !!(props.onclick || props.onpointerenter || props.onpointermove || props.onpointerleave)
  );

  /** A little above its fill, so its outline draws over it */
  const LINE_LIFT = 0.3;

  createMerged({
    items: () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      paths.version;
      /** What each class sets, read once for all the cells sharing it */
      const looks = new Map<string, ClassStyle | null>();
      const lookOf = (classes: string | undefined) => {
        const key = classes ?? '';
        if (!looks.has(key)) looks.set(key, key ? scene.style(key) : null);
        return looks.get(key)!;
      };
      return paths.list.flatMap((path: BinPath) => {
        if (!path.pathData) return [];
        const subpaths = parsePath(path.pathData);
        if (!subpaths.length) return [];
        const look = lookOf(path.class);
        // A class's own fill and stroke win over the props, as CSS does in core's layers
        const fill = (look?.fillSet ? look.fill : null) ?? path.fill ?? look?.fill ?? null;
        const stroke = (look?.strokeSet ? look.stroke : null) ?? path.stroke ?? look?.stroke ?? null;
        const resolved = fill && fill !== 'none' ? scene.color(fill) : null;
        const alpha = path.opacity * path.fillOpacity * (look?.opacity ?? 1);
        let geometry: ShapeGeometry | null = null;
        if (resolved) {
          const shape = new ShapePath();
          for (const { points } of subpaths) {
            shape.moveTo(...points[0]);
            for (const point of points.slice(1)) shape.lineTo(...point);
          }
          // In the scene's axes: across, up off the floor, and down the plot
          geometry = new ShapeGeometry(shape.toShapes())
            .rotateX(Math.PI / 2)
            .translate(0, path.z + 0.1, 0);
        }
        const outlined = stroke != null && stroke !== 'none' && (path.strokeWidth ?? 1) > 0;
        return [
          {
            d: path,
            geometry,
            fill: null,
            fillColor: resolved
              ? ([
                  resolved.color.r,
                  resolved.color.g,
                  resolved.color.b,
                  resolved.opacity * alpha,
                ] as [number, number, number, number])
              : undefined,
            lines: outlined
              ? subpaths.map(({ points }) =>
                  points.flatMap(([px, py]) => [px, path.z + 0.1 + LINE_LIFT, py])
                )
              : [],
            stroke: outlined ? stroke : null,
          },
        ];
      });
    },
    opacity: () => 1,
    lineOpacity: () => {
      const first = paths.list.find((p) => p.stroke && p.stroke !== 'none');
      return first ? first.opacity * first.strokeOpacity : 1;
    },
    strokeWidth: () => paths.list.find((p) => p.strokeWidth != null)?.strokeWidth ?? 1,
    // Picked for the cells' pointer handlers (`onclick`, ...), each with its cell
    events: () =>
      handled
        ? {
            onclick: (e, { data }) => (data as BinPath).onclick?.(e),
            onpointerenter: (e, { data }) => (data as BinPath).onpointerenter?.(e),
            onpointermove: (e, { data }) => (data as BinPath).onpointermove?.(e),
            onpointerleave: (e, { data }) => (data as BinPath).onpointerleave?.(e),
          }
        : undefined,
    tooltip: () => false,
  });
</script>

<!-- LayerChart's `GeoBin`: its cells binned over the sphere as the core `GeoBin` bins them, and
     drawn together in one mesh -->
<BinBase
  {Group}
  Path={columns ? Path : GeoBinPath}
  {ChartClipPath}
  sphere={sphereBinning}
  {...props}
/>
