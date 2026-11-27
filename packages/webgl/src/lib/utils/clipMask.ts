import {
  CanvasTexture,
  LinearFilter,
  Matrix4,
  Vector3,
  type BufferAttribute,
  type Camera,
  type InstancedMesh,
  type InterleavedBufferAttribute,
  type Mesh,
  type Material,
  type Object3D,
  type WebGLProgramParametersWithUniforms,
} from 'three';

import { restoreOwnShader, saveOwnShader, type SceneClipMask } from './clip.js';
import { parsePath } from './path.js';

/** The least and most `x` and `y` of points, skipping any that aren't finite */
class Bounds {
  x0 = Infinity;
  y0 = Infinity;
  x1 = -Infinity;
  y1 = -Infinity;
  add(x: number, y: number) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    this.x0 = Math.min(this.x0, x);
    this.y0 = Math.min(this.y0, y);
    this.x1 = Math.max(this.x1, x);
    this.y1 = Math.max(this.y1, y);
  }
}

/**
 * Whether a mesh is a shape's fill: not its outline (fat lines are meshes too) nor a label's
 * plane (a painting)
 */
function isFill(mesh: Mesh) {
  const line = mesh as Mesh & { isLineSegments2?: boolean; isLine2?: boolean };
  if (line.isLineSegments2 || line.isLine2) return false;
  const material = mesh.material as Material & { map?: unknown };
  return !(material && !Array.isArray(material) && material.map);
}

/** The most pixels a mask's canvas is across or down */
const MAX_SIZE = 4096;

/**
 * A clip shape (SVG path data, in its `ClipPath`'s frame) painted onto a canvas, which the marks
 * inside sample: each fragment is drawn only where the canvas is painted under it, looked up by
 * where it is on the plot (its `x` across and `y` down), so the shape clips the same seen from any
 * angle, as a stencil would from above.  Loaded only when a clip isn't a plain rectangle.
 */
export class ClipMask implements SceneClipMask {
  readonly #canvas = document.createElement('canvas');
  readonly #context = this.#canvas.getContext('2d')!;
  #texture = this.#makeTexture();
  /** The mask's lookup: a point in the camera's space to the mask's texture (`x` and `z`) */
  readonly #lookup = new Matrix4();
  /** Its frame to the texture */
  readonly #fit = new Matrix4();
  readonly uniforms = { lcMask: { value: this.#texture }, lcMaskLookup: { value: this.#lookup } };
  /** Its shapes, each filled on its own, so where they overlap they add up (as SVG's do) */
  #shapes: Path2D[] = [];
  #rule: CanvasFillRule = 'nonzero';
  /** The materials clipped to it */
  readonly #materials = new Set<Material>();

  #makeTexture() {
    const texture = new CanvasTexture(this.#canvas);
    // The canvas' top row is the frame's least `y`, where the texture's `v` is 0
    texture.flipY = false;
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    return texture;
  }

  /**
   * Paint `path` (`evenodd` for an inverted clip, as the core `ClipPath` fills it), at `scale`
   * canvas pixels per chart pixel
   */
  draw(path: string, rule: CanvasFillRule, scale: number) {
    const bounds = new Bounds();
    for (const { points } of parsePath(path)) {
      for (const [x, y] of points) bounds.add(x, y);
    }
    this.#paint([new Path2D(path)], rule, bounds, scale);
  }

  /**
   * Paint the fills of the meshes in `source` (a `ClipPath`'s `clip` snippet's marks, drawn there
   * rather than in the scene), as seen from above, and `paths` (its SVG elements' shapes, see
   * `elementPaths`), as an SVG `<clipPath>` takes the shapes in it: their fills' outlines,
   * whatever their colors
   */
  drawShapes(source: Object3D, paths: string[], scale: number) {
    source.updateMatrixWorld(true);
    const shape = new Path2D();
    const shapes = [shape];
    const bounds = new Bounds();
    for (const path of paths) {
      shapes.push(new Path2D(path));
      for (const { points } of parsePath(path)) {
        for (const [x, y] of points) bounds.add(x, y);
      }
    }
    const point = new Vector3();
    const corners: number[] = [];
    const matrix = new Matrix4();
    source.traverseVisible((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh || !isFill(mesh)) return;
      const position = mesh.geometry.getAttribute('position');
      if (!position) return;
      const index = mesh.geometry.getIndex();
      const count = index ? index.count : position.count;
      const instanced = mesh as InstancedMesh;
      // Each instance where it's placed (ex. a `Circle`'s), else the mesh where it is
      const placements = instanced.isInstancedMesh ? instanced.count : 1;
      for (let n = 0; n < placements; n++) {
        if (instanced.isInstancedMesh) {
          instanced.getMatrixAt(n, matrix);
          matrix.premultiply(mesh.matrixWorld);
        } else {
          matrix.copy(mesh.matrixWorld);
        }
        triangles(position, index, count, matrix);
      }
    });
    this.#paint(shapes, 'nonzero', bounds, scale);

    function triangles(
      position: BufferAttribute | InterleavedBufferAttribute,
      index: BufferAttribute | null,
      count: number,
      matrix: Matrix4
    ) {
      for (let i = 0; i + 2 < count; i += 3) {
        corners.length = 0;
        for (let j = 0; j < 3; j++) {
          const vertex = index ? index.getX(i + j) : i + j;
          point.fromBufferAttribute(position, vertex).applyMatrix4(matrix);
          // Across and down the plot (the scene's `x` and `z`)
          corners.push(point.x, point.z);
        }
        const [ax, ay, bx, by, cx, cy] = corners;
        const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        // Edge on from above (ex. an extruded shape's sides): nothing to fill
        if (!(Math.abs(area) > 1e-9)) continue;
        // Each the same way round, so where they overlap (ex. an extruded shape's top and bottom)
        // they add up rather than cancel out under the `nonzero` rule
        shape.moveTo(ax, ay);
        if (area > 0) {
          shape.lineTo(bx, by);
          shape.lineTo(cx, cy);
        } else {
          shape.lineTo(cx, cy);
          shape.lineTo(bx, by);
        }
        shape.closePath();
        bounds.add(ax, ay);
        bounds.add(bx, by);
        bounds.add(cx, cy);
      }
    }
  }

  #paint(shapes: Path2D[], rule: CanvasFillRule, bounds: Bounds, scale: number) {
    let { x0, y0, x1, y1 } = bounds;
    if (!(x1 >= x0 && y1 >= y0)) x0 = y0 = x1 = y1 = 0;
    // A pixel around it, for its edges' antialiasing
    x0 = Math.floor(x0) - 1;
    y0 = Math.floor(y0) - 1;
    const width = Math.ceil(x1) + 1 - x0;
    const height = Math.ceil(y1) + 1 - y0;
    const k = Math.min(scale, MAX_SIZE / Math.max(width, height, 1));
    const canvasWidth = Math.max(1, Math.ceil(width * k));
    const canvasHeight = Math.max(1, Math.ceil(height * k));

    // A texture keeps the size it's first given: a new one for a new size
    if (canvasWidth !== this.#canvas.width || canvasHeight !== this.#canvas.height) {
      this.#canvas.width = canvasWidth;
      this.#canvas.height = canvasHeight;
      this.#texture.dispose();
      this.#texture = this.#makeTexture();
      this.uniforms.lcMask.value = this.#texture;
    }
    const context = this.#context;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
    this.#shapes = shapes;
    this.#rule = rule;
    context.fillStyle = '#fff';
    for (const shape of shapes) context.fill(shape, rule);
    this.#texture.needsUpdate = true;
    // Across and down its frame (the scene's `x` and `z`) to the texture's `u` and `v`
    const sx = canvasWidth / k;
    const sy = canvasHeight / k;
    this.#fit.set(1 / sx, 0, 0, -x0 / sx, 0, 1, 0, 0, 0, 0, 1 / sy, -y0 / sy, 0, 0, 0, 1);
  }

  /**
   * The shapes of the SVG elements in `host` (ex. a `clip` snippet's `<circle>` and `<rect>`), as
   * path data, by their attributes (they're never laid out)
   */
  elementPaths(host: Element) {
    const paths: string[] = [];
    const number = (element: Element, name: string) => Number(element.getAttribute(name)) || 0;
    for (const element of host.querySelectorAll('path, rect, circle, ellipse, polygon')) {
      switch (element.localName) {
        case 'path': {
          const d = element.getAttribute('d');
          if (d) paths.push(d);
          break;
        }
        case 'rect': {
          const [x, y] = [number(element, 'x'), number(element, 'y')];
          const [width, height] = [number(element, 'width'), number(element, 'height')];
          if (width > 0 && height > 0) paths.push(`M${x},${y}h${width}v${height}h${-width}Z`);
          break;
        }
        case 'circle':
        case 'ellipse': {
          const [cx, cy] = [number(element, 'cx'), number(element, 'cy')];
          const rx = number(element, element.localName === 'circle' ? 'r' : 'rx');
          const ry = element.localName === 'circle' ? rx : number(element, 'ry');
          if (rx > 0 && ry > 0) {
            paths.push(
              `M${cx - rx},${cy}a${rx},${ry} 0 1,0 ${2 * rx},0a${rx},${ry} 0 1,0 ${-2 * rx},0Z`
            );
          }
          break;
        }
        case 'polygon': {
          const points = element.getAttribute('points')?.trim();
          if (points) paths.push(`M${points.split(/[\s,]+/).join(' ')}Z`);
          break;
        }
      }
    }
    return paths;
  }

  update(object: Object3D, camera: Camera) {
    this.#lookup
      .copy(object.matrixWorld)
      .invert()
      .multiply(camera.matrixWorld)
      .premultiply(this.#fit);
  }

  contains(x: number, y: number) {
    if (!this.#shapes.length) return false;
    this.#context.save();
    this.#context.setTransform(1, 0, 0, 1, 0, 0);
    const inside = this.#shapes.some((shape) =>
      this.#context.isPointInPath(shape, x, y, this.#rule)
    );
    this.#context.restore();
    return inside;
  }

  attach(material: Material) {
    const saved = saveOwnShader(material);
    const before = (saved.onBeforeCompile as Material['onBeforeCompile']) ?? null;
    const key = material.customProgramCacheKey();
    const uniforms = this.uniforms;
    material.onBeforeCompile = function (shader, renderer) {
      before?.call(this, shader, renderer);
      maskShader(shader, uniforms);
    };
    material.customProgramCacheKey = () => `${key}|lc-clip-mask`;
    material.userData.lcMask = this;
    material.needsUpdate = true;
    this.#materials.add(material);
  }

  detach(material: Material) {
    restoreOwnShader(material);
    delete material.userData.lcMask;
    material.needsUpdate = true;
    this.#materials.delete(material);
  }

  dispose() {
    for (const material of [...this.#materials]) this.detach(material);
    this.#texture.dispose();
    this.#shapes = [];
  }
}

/**
 * A material's shaders, dropping fragments outside the mask: where a fragment is on the plot,
 * from its position in the camera's space (as its clipping planes take it, so every material that
 * can be clipped can be masked), looked up in the mask's texture
 */
function maskShader(shader: WebGLProgramParametersWithUniforms, uniforms: ClipMask['uniforms']) {
  shader.uniforms.lcMask = uniforms.lcMask;
  shader.uniforms.lcMaskLookup = uniforms.lcMaskLookup;
  shader.vertexShader = shader.vertexShader
    .replace('#include <clipping_planes_pars_vertex>', '$&\nvarying vec3 vLcClipView;')
    .replace('#include <clipping_planes_vertex>', '$&\nvLcClipView = mvPosition.xyz;');
  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <clipping_planes_pars_fragment>',
      '$&\nvarying vec3 vLcClipView;\nuniform sampler2D lcMask;\nuniform mat4 lcMaskLookup;'
    )
    .replace(
      '#include <clipping_planes_fragment>',
      `$&
{
  vec2 lcMaskUv = ( lcMaskLookup * vec4( vLcClipView, 1.0 ) ).xz;
  if ( any( lessThan( lcMaskUv, vec2( 0.0 ) ) ) || any( greaterThan( lcMaskUv, vec2( 1.0 ) ) ) ||
    texture2D( lcMask, lcMaskUv ).a < 0.5 ) discard;
}`
    );
}
