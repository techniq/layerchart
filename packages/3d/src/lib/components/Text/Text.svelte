<script lang="ts" module>
  import type { ValueProp } from '../../utils/values.js';

  export type TextProps = {
    /** Rows to draw a label each for.  Without them, one label. */
    data?: any[];
    /** The text, or a function of the row */
    value: ValueProp<string | number | null | undefined>;
    /** Across the plot, in pixels, or a function of the row */
    x: ValueProp<number>;
    /** Down the plot, in pixels, or a function of the row */
    y: ValueProp<number>;
    /**
     * Height off the floor, in pixels, or a function of the row.
     *
     * @default 0
     */
    z?: ValueProp<number>;
    /**
     * `'camera'` draws labels over the scene, upright and crisp however the view turns (styled
     * with `class`).  `'up'` lays them on the surface at their height (ex. the tops of boxes),
     * turning and tipping with the view, and hidden behind whatever's nearer.
     *
     * @default 'camera'
     */
    facing?: 'camera' | 'up';
    /**
     * Font size in pixels of the plot, for labels facing `up`.
     *
     * @default 12
     */
    fontSize?: ValueProp<number>;
    /**
     * Font weight, for labels facing `up`.
     *
     * @default 600
     */
    fontWeight?: number | string;
    /**
     * Which way labels facing `up` run, in degrees clockwise from left to right across the plot.
     * Turned half round whenever they'd read backwards from where the view is.
     *
     * @default 0
     */
    rotate?: ValueProp<number>;
    /**
     * The CSS color of labels facing `up`.
     *
     * @default 'var(--color-surface-content)'
     */
    fill?: ValueProp<string>;
    /** Class added to each label facing the `camera` */
    class?: string;
  };
</script>

<script lang="ts">
  import {
    CanvasTexture,
    Group,
    Mesh,
    MeshLambertMaterial,
    PlaneGeometry,
    SRGBColorSpace,
    Vector3,
  } from 'three';

  import { getSceneContext, type SceneLabel } from '../../contexts/scene.svelte.js';
  import { valueOf } from '../../utils/values.js';

  let {
    data,
    value,
    x,
    y,
    z = 0,
    facing = 'camera',
    fontSize = 12,
    fontWeight = 600,
    rotate = 0,
    fill = 'var(--color-surface-content, currentColor)',
    class: className,
  }: TextProps = $props();

  const scene = getSceneContext();

  const rows = $derived(
    (data ?? [undefined]).flatMap((d) => {
      const text = valueOf(value, d);
      return text == null || text === '' ? [] : [{ d, text: String(text) }];
    })
  );

  // Facing the camera: drawn over the scene, so text stays crisp and upright however it turns
  const labels = $derived(
    facing === 'camera'
      ? rows.map(
          ({ d, text }, i): SceneLabel => ({
            key: String(i),
            x: valueOf(x, d),
            y: valueOf(y, d),
            z: valueOf(z, d),
            text,
            class: className,
          })
        )
      : []
  );

  $effect(() => scene.addLabels(labels));

  // Facing up: each label painted onto a plane lying at its height
  /** Canvas pixels per pixel of the plot, so text stays sharp up close */
  const RESOLUTION = 4;
  const group = new Group();
  scene.root.add(group);
  /** Each plane's turn as given, before any half turn to read the right way round */
  const turns = new Map<Mesh, number>();

  $effect(() => {
    const planes: Mesh[] = [];
    turns.clear();
    if (facing === 'up') {
      const family =
        typeof document === 'undefined' ? 'sans-serif' : getComputedStyle(document.body).fontFamily;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      for (const { d, text } of rows) {
        const size = valueOf(fontSize, d);
        if (!(size > 0)) continue;
        const resolved = scene.color(valueOf(fill, d));
        const font = `${fontWeight} ${size * RESOLUTION}px ${family}`;
        context.font = font;
        const width = Math.ceil(context.measureText(text).width) + 2;
        const height = Math.ceil(size * RESOLUTION * 1.3);

        const label = document.createElement('canvas');
        label.width = width;
        label.height = height;
        const paint = label.getContext('2d')!;
        paint.font = font;
        paint.textAlign = 'center';
        paint.textBaseline = 'middle';
        const color = resolved?.color.clone().convertLinearToSRGB();
        paint.fillStyle = color ? `#${color.getHexString()}` : 'black';
        paint.globalAlpha = resolved?.opacity ?? 1;
        paint.fillText(text, width / 2, height / 2);

        const texture = new CanvasTexture(label);
        texture.colorSpace = SRGBColorSpace;
        // Blended by coverage at the glyphs' edges, rather than against transparent black
        texture.premultiplyAlpha = true;
        texture.anisotropy = 8;
        // Lying face up, reading along `x` with its top towards the plot's far side
        const geometry = new PlaneGeometry(width / RESOLUTION, height / RESOLUTION).rotateX(
          -Math.PI / 2
        );
        const plane = new Mesh(
          geometry,
          // Lit like the surface it lies on, so it shades along with it
          new MeshLambertMaterial({
            map: texture,
            transparent: true,
            premultipliedAlpha: true,
            depthWrite: false,
          })
        );
        // Lifted a little off what it lies on
        plane.position.set(valueOf(x, d), valueOf(z, d) + 0.3, valueOf(y, d));
        turns.set(plane, (-valueOf(rotate, d) * Math.PI) / 180);
        planes.push(plane);
      }
      group.add(...planes);
    }
    turnToReader();
    scene.invalidate();

    return () => {
      for (const plane of planes) {
        group.remove(plane);
        plane.geometry.dispose();
        const material = plane.material as MeshLambertMaterial;
        material.map?.dispose();
        material.dispose();
      }
    };
  });

  const right = new Vector3();
  /** Turn each label half round when, from where the camera is, it would read right to left */
  function turnToReader() {
    const camera = scene.camera;
    if (camera) right.setFromMatrixColumn(camera.matrixWorld, 0);
    for (const [plane, turn] of turns) {
      // Which way the baseline runs in the scene, against the camera's left to right
      const across = Math.cos(turn) * right.x - Math.sin(turn) * right.z;
      plane.rotation.y = camera && across < 0 ? turn + Math.PI : turn;
    }
  }

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    scene.cameraVersion;
    turnToReader();
  });

  $effect(() => {
    return () => {
      scene.root.remove(group);
      scene.invalidate();
    };
  });
</script>
