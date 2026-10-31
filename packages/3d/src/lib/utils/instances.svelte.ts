import { untrack } from 'svelte';
import {
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  MeshLambertMaterial,
  Quaternion,
  Vector3,
  type BufferAttribute,
  type BufferGeometry,
} from 'three';
import { getChartContext } from 'layerchart';

import { getSceneContext } from '../contexts/scene.svelte.js';

/**
 * One shape of an instanced mark, in chart pixels: where it stands (`x` across, `y` down the
 * plot, `z` up), how far it reaches along each, and its CSS color.
 */
export type Instance = {
  d: any;
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
};

type InstancesOptions = {
  /** The shape every instance draws, scaled by its `width` / `height` / `depth` */
  geometry: BufferGeometry;
  instances: () => Instance[];
  /** Multiplies each instance's own color alpha */
  opacity: () => number;
  /** Mark the hovered instance, by changing its color or size in place */
  emphasize: (color: Color, size: Vector3) => void;
};

/**
 * Lambert shading, with each instance's alpha from an `instanceOpacity` attribute, since
 * `InstancedMesh` colors carry no alpha of their own.
 */
function createMaterial() {
  const material = new MeshLambertMaterial();
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute float instanceOpacity;\nvarying float vInstanceOpacity;'
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvInstanceOpacity = instanceOpacity;'
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vInstanceOpacity;')
      .replace(
        '#include <opaque_fragment>',
        '#include <opaque_fragment>\ngl_FragColor.a *= vInstanceOpacity;'
      );
  };
  // Keep the patched program apart from plain Lambert materials' in three's cache
  material.customProgramCacheKey = () => 'lc-instance-opacity';
  return material;
}

/**
 * Draws a mark's `instances` as one `InstancedMesh` in the scene: grows it as rows are added,
 * lets the pointer pick rows for the tooltip, and emphasizes the hovered row by rewriting only
 * that instance (and the one it replaces).  Call during component setup.
 */
export function createInstances({ geometry, instances, opacity, emphasize }: InstancesOptions) {
  const ctx = getChartContext();
  const scene = getSceneContext();
  const material = createMaterial();

  // Out of a scale's domain (ex. a category a band scale doesn't list) a position is `NaN`, which
  // would poison the bounding sphere every pointer pick tests first
  const list = $derived(
    instances().filter((i) =>
      [i.x, i.y, i.z, i.width, i.depth, i.height].every((v) => Number.isFinite(v))
    )
  );

  let mesh = $state.raw<InstancedMesh | null>(null);
  let alpha: BufferAttribute | null = null;

  // An instanced mesh can't grow, so make a bigger one when the rows outgrow it
  $effect.pre(() => {
    const count = list.length;
    if (mesh && mesh.instanceMatrix.count >= count) return;
    const capacity = Math.max(1, Math.ceil(count * 1.5));
    alpha = new InstancedBufferAttribute(new Float32Array(capacity).fill(1), 1);
    geometry.setAttribute('instanceOpacity', alpha);
    const next = new InstancedMesh(geometry, material, capacity);
    next.count = 0;
    if (mesh) {
      scene.root.remove(mesh);
      mesh.dispose();
    }
    scene.root.add(next);
    mesh = next;
  });

  $effect(() => {
    const instanced = mesh;
    if (!instanced) return;
    return scene.addPickable({
      object: instanced,
      datum: (hit) => (hit.instanceId != null ? list[hit.instanceId]?.d : undefined),
    });
  });

  const matrix = new Matrix4();
  const position = new Vector3();
  const rotation = new Quaternion();
  const size = new Vector3();
  const color = new Color();
  const missing = new Color(0x888888);

  /** Each row's index, to find the hovered one */
  const index = new Map<any, number>();
  let emphasized = -1;

  /** Write instance `i`, returning its color's alpha */
  function write(instanced: InstancedMesh, i: number, item: Instance, hovered: boolean) {
    const resolved = scene.color(item.color);
    position.set(item.x, item.z, item.y);
    // A zero size collapses the matrix, which can't be inverted for picking
    size.set(Math.max(item.width, 1e-6), Math.max(item.height, 1e-6), Math.max(item.depth, 1e-6));
    color.copy(resolved?.color ?? missing);
    if (hovered) emphasize(color, size);
    instanced.setMatrixAt(i, matrix.compose(position, rotation, size));
    instanced.setColorAt(i, color);
    return resolved?.opacity ?? 1;
  }

  // Every row, whenever any changes
  $effect(() => {
    const instanced = mesh;
    const attribute = alpha;
    if (!instanced || !attribute) return;
    const items = list;
    const hovered = untrack(() => ctx.tooltip.data);

    index.clear();
    emphasized = -1;
    let translucent = false;
    items.forEach((item, i) => {
      index.set(item.d, i);
      if (item.d === hovered) emphasized = i;
      const a = write(instanced, i, item, item.d === hovered);
      attribute.setX(i, a);
      if (a < 1) translucent = true;
    });
    instanced.count = items.length;
    for (const buffer of [instanced.instanceMatrix, instanced.instanceColor, attribute]) {
      if (!buffer) continue;
      buffer.clearUpdateRanges();
      buffer.needsUpdate = true;
    }
    instanced.computeBoundingSphere();

    const o = opacity();
    material.opacity = o;
    // Switching blending recompiles, so only when it changes
    if (material.transparent !== (translucent || o < 1)) {
      material.transparent = translucent || o < 1;
      material.needsUpdate = true;
    }
    scene.invalidate();
  });

  // Hovering rewrites only the rows it moves between
  $effect(() => {
    const hovered = ctx.tooltip.data;
    untrack(() => {
      const instanced = mesh;
      if (!instanced) return;
      const next = hovered == null ? -1 : (index.get(hovered) ?? -1);
      if (next === emphasized) return;
      const changed = [emphasized, next].filter((i) => i >= 0 && i < list.length);
      if (emphasized >= 0 && emphasized < list.length)
        write(instanced, emphasized, list[emphasized], false);
      if (next >= 0) write(instanced, next, list[next], true);
      emphasized = next;
      for (const i of changed) {
        instanced.instanceMatrix.addUpdateRange(i * 16, 16);
        instanced.instanceColor?.addUpdateRange(i * 3, 3);
      }
      instanced.instanceMatrix.needsUpdate = true;
      if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
      scene.invalidate();
    });
  });

  $effect(() => {
    return () => {
      if (mesh) scene.root.remove(mesh);
      mesh?.dispose();
      geometry.dispose();
      material.dispose();
      scene.invalidate();
    };
  });
}
