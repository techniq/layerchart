import { untrack } from 'svelte';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshLambertMaterial,
  NormalBlending,
  Quaternion,
  Vector3,
  Vector4,
  type BufferAttribute,
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
  /** Turned (ex. to stand out from a globe), about the corner at `x` / `y` / `z` */
  rotation?: Quaternion;
};

type InstancesOptions = {
  /**
   * The shape every instance draws, scaled by its `width` / `height` / `depth`, or a function
   * returning it when it changes (ex. with the chart's `view`)
   */
  geometry: BufferGeometry | (() => BufferGeometry);
  instances: () => Instance[];
  /** Multiplies each instance's own color alpha */
  opacity: () => number;
  /** Mark the hovered instance, by changing its color or size in place */
  emphasize: (color: Color, size: Vector3) => void;
  /** Whether hovering shows the tooltip */
  tooltip?: () => boolean;
  /** Draw each instance in its own color, unlit (ex. a star) */
  glow?: () => boolean;
  /**
   * Add each instance's light to what's behind it rather than covering it (ex. stars crowding
   * into a bright core), as CSS' `mix-blend-mode: plus-lighter` does
   */
  additive?: () => boolean;
  /**
   * Move every instance's center across (`x`) and down (`y`) the plot by a scale and offset each,
   * `[kx, tx, ky, ty]`, on the GPU: ex. as a `domain` transform pans and zooms linear scales,
   * without placing every row again.  `null` for none.
   */
  shift?: () => [kx: number, tx: number, ky: number, ty: number] | null;
  /**
   * Lose to lines lying on the instances' faces (ex. a box's outline along its edges): pushed back
   * a hair in depth, by more where a face is seen edge on, rather than the lines moved off them
   */
  behind?: () => boolean;
  /**
   * Draw `ringGeometry`'s ring about each instance's edge, this many scene units either side of
   * it whatever the instance's size (ex. half a point's stroke width), as an SVG stroke straddles
   * a circle's edge
   */
  ring?: () => number;
};

/**
 * A ring for `createInstances`' `ring`: the unit circle lying flat (facing up, as a disc made by
 * `CircleGeometry(1).rotateX(-Math.PI / 2)` does), each point twice, which the shader moves in
 * and out to the ring's edges
 */
export function ringGeometry(segments = 32) {
  const positions: number[] = [];
  const sides: number[] = [];
  const normals: number[] = [];
  for (let k = 0; k <= segments; k++) {
    const angle = (k / segments) * Math.PI * 2;
    for (const side of [-1, 1]) {
      positions.push(Math.cos(angle), 0, -Math.sin(angle));
      sides.push(side);
      normals.push(0, 1, 0);
    }
  }
  const index: number[] = [];
  for (let k = 0; k < segments; k++) {
    const [a, b, c, d] = [2 * k, 2 * k + 1, 2 * k + 3, 2 * k + 2];
    index.push(a, b, c, a, c, d);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('ringSide', new Float32BufferAttribute(sides, 1));
  geometry.setIndex(index);
  return geometry;
}

/** The `shift` a material draws with, shared by its compiled program */
const shifts = new WeakMap<MeshLambertMaterial | MeshBasicMaterial, { value: Vector4 }>();

/**
 * Lambert shading, with each instance's alpha from an `instanceOpacity` attribute, since
 * `InstancedMesh` colors carry no alpha of their own.
 */
function createMaterial(lit: boolean, ring = false) {
  // Unlit, each instance shows its own color whatever the lights (ex. a star)
  const material = lit ? new MeshLambertMaterial() : new MeshBasicMaterial();
  const shift = { value: new Vector4(1, 0, 1, 0) };
  shifts.set(material, shift);
  material.userData.shift = shift.value;
  const ringHalf = { value: 0 };
  material.userData.ringHalf = ringHalf;
  if (ring) material.defines = { LC_RING: '' };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uShift = shift;
    shader.uniforms.uRingHalf = ringHalf;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute float instanceOpacity;\nvarying float vInstanceOpacity;\nuniform vec4 uShift;\n#ifdef LC_RING\nattribute float ringSide;\nuniform float uRingHalf;\n#endif'
      )
      .replace(
        '#include <begin_vertex>',
        // A ring's edges, its half width in and out from the instance's own edge (its scale)
        `#include <begin_vertex>
vInstanceOpacity = instanceOpacity;
#if defined( LC_RING ) && defined( USE_INSTANCING )
	transformed.xz *= 1.0 + ringSide * uRingHalf / max( length( instanceMatrix[0].xyz ), 1e-6 );
#endif`
      )
      // Each instance's center moved by `shift` (chart `x` is the scene's `x`, chart `y` its `z`)
      .replace(
        '#include <project_vertex>',
        `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
	vec2 lcCenter = instanceMatrix[3].xz;
	mvPosition.xz += vec2( lcCenter.x * uShift.x + uShift.y, lcCenter.y * uShift.z + uShift.w ) - lcCenter;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vInstanceOpacity;')
      .replace(
        '#include <opaque_fragment>',
        '#include <opaque_fragment>\ngl_FragColor.a *= vInstanceOpacity;'
      );
  };
  // Keep the patched program apart from plain Lambert materials' in three's cache
  material.customProgramCacheKey = () =>
    `lc-instance-opacity-${lit ? 'lit' : 'unlit'}${ring ? '-ring' : ''}`;
  return material;
}

/**
 * Draws a mark's `instances` as one `InstancedMesh` in the scene: grows it as rows are added,
 * lets the pointer pick rows for the tooltip, and emphasizes the hovered row by rewriting only
 * that instance (and the one it replaces).  Call during component setup.
 */
export function createInstances({
  geometry,
  instances,
  opacity,
  emphasize,
  tooltip,
  glow,
  additive,
  shift,
  behind,
  ring,
}: InstancesOptions) {
  const ctx = getChartContext();
  const scene = getSceneContext();
  /** Its objects, stacked with other marks' in the order they're declared */
  const layer = scene.layer();
  const litMaterial = createMaterial(true, !!ring);
  /** Made the first time something glows */
  let glowMaterial: MeshBasicMaterial | null = null;
  const material = $derived(
    glow?.() ? (glowMaterial ??= createMaterial(false, !!ring) as MeshBasicMaterial) : litMaterial
  );

  // Out of a scale's domain (ex. a category a band scale doesn't list) a position is `NaN`, which
  // would poison the bounding sphere every pointer pick tests first
  const list = $derived(
    instances().filter((i) =>
      [i.x, i.y, i.z, i.width, i.depth, i.height].every((v) => Number.isFinite(v))
    )
  );

  let mesh = $state.raw<InstancedMesh | null>(null);
  let alpha: BufferAttribute | null = null;

  const shape = $derived(typeof geometry === 'function' ? geometry() : geometry);
  /** Every shape drawn, to dispose of at the end */
  const shapes = new Set<BufferGeometry>();

  // An instanced mesh can't grow, so make a bigger one when the rows outgrow it (or the shape
  // changes)
  $effect.pre(() => {
    const count = list.length;
    const geometry = shape;
    shapes.add(geometry);
    // Nothing yet to draw (ex. a mark's outlines when it has none): no mesh until there is
    if (!mesh && count === 0) return;
    if (mesh && mesh.geometry === geometry && mesh.instanceMatrix.count >= count) return;
    const capacity = Math.max(1, Math.ceil(count * 1.5));
    alpha = new InstancedBufferAttribute(new Float32Array(capacity).fill(1), 1);
    geometry.setAttribute('instanceOpacity', alpha);
    const next = new InstancedMesh(
      geometry,
      untrack(() => material),
      capacity
    );
    next.count = 0;
    next.castShadow = next.receiveShadow = true;
    if (mesh) {
      layer.remove(mesh);
      mesh.dispose();
    }
    layer.add(next);
    mesh = next;
  });

  // Moved on the GPU, so the instances' bounds (from where they were placed) don't say where they
  // are drawn
  $effect(() => {
    const value = shift?.() ?? null;
    // Again when the material changes, so a glow made mid-pan is shifted too
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    material;
    const [kx, tx, ky, ty] = value ?? [1, 0, 1, 0];
    for (const m of [litMaterial, glowMaterial]) if (m) shifts.get(m)!.value.set(kx, tx, ky, ty);
    if (mesh) mesh.frustumCulled = !value;
    scene.invalidate();
  });

  // Lit, or glowing in its own colors
  $effect(() => {
    const instanced = mesh;
    if (!instanced) return;
    instanced.material = material;
    instanced.castShadow = material === litMaterial;
    scene.invalidate();
  });

  $effect(() => {
    const instanced = mesh;
    if (!instanced || !tooltip?.()) return;
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
  /**
   * Every row has been written and not yet drawn, so the whole buffer goes to the GPU: a hover
   * before then mustn't narrow it to the rows it changed (three.js uploads only the ranges given),
   * or every other row would keep where it was last drawn
   */
  let wholePending = false;

  /** Write instance `i`, returning its color's alpha */
  function write(instanced: InstancedMesh, i: number, item: Instance, hovered: boolean) {
    const resolved = scene.color(item.color);
    position.set(item.x, item.z, item.y);
    // A zero size collapses the matrix, which can't be inverted for picking
    size.set(Math.max(item.width, 1e-6), Math.max(item.height, 1e-6), Math.max(item.depth, 1e-6));
    color.copy(resolved?.color ?? missing);
    if (hovered) emphasize(color, size);
    instanced.setMatrixAt(i, matrix.compose(position, item.rotation ?? rotation, size));
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
    wholePending = true;
    instanced.onAfterRender = () => {
      wholePending = false;
    };
    instanced.computeBoundingSphere();

    const o = opacity();
    material.opacity = o;
    if (ring) material.userData.ringHalf.value = ring();
    // A depth offset needs no new program, so it can follow along
    const back = behind?.() ?? false;
    material.polygonOffset = back;
    material.polygonOffsetFactor = back ? 1 : 0;
    material.polygonOffsetUnits = back ? 1 : 0;
    // Adding light, it's drawn over everything else without hiding what's behind it
    const adds = additive?.() ?? false;
    // Switching blending recompiles, so only when it changes
    if (
      material.transparent !== (translucent || o < 1 || adds) ||
      (material.blending === AdditiveBlending) !== adds
    ) {
      material.transparent = translucent || o < 1 || adds;
      material.blending = adds ? AdditiveBlending : NormalBlending;
      material.depthWrite = !adds;
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
      if (!wholePending) {
        for (const i of changed) {
          instanced.instanceMatrix.addUpdateRange(i * 16, 16);
          instanced.instanceColor?.addUpdateRange(i * 3, 3);
        }
      }
      instanced.instanceMatrix.needsUpdate = true;
      if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
      scene.invalidate();
    });
  });

  $effect(() => {
    return () => {
      if (mesh) layer.remove(mesh);
      mesh?.dispose();
      for (const shape of shapes) shape.dispose();
      litMaterial.dispose();
      glowMaterial?.dispose();
      scene.invalidate();
    };
  });
}
