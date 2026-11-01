<script lang="ts" module>
  export type LightProps = {
    /**
     * `'directional'` shines from far away in one direction, like the sun; `'ambient'` lights
     * everything evenly, from no direction.
     *
     * @default 'directional'
     */
    type?: 'directional' | 'ambient';
    /**
     * Which way a directional light shines from, in degrees clockwise from the plot's top edge (its
     * far edge before the view turns), like a compass bearing on a map.
     *
     * @default 315 (from the top left, as shaded relief is lit)
     */
    azimuth?: number;
    /**
     * How high a directional light is, in degrees above the floor.
     *
     * @default 45
     */
    altitude?: number;
    /**
     * Brightness, where `1` lights a face turned to the light at its own color.
     *
     * @default 1
     */
    intensity?: number;
    /**
     * The light's CSS color.
     *
     * @default 'white'
     */
    color?: string;
    /**
     * Cast shadows, onto the marks and the floor.
     *
     * @default false
     */
    shadow?: boolean;
  };
</script>

<script lang="ts">
  import {
    AmbientLight,
    BufferGeometry,
    DirectionalLight,
    Float32BufferAttribute,
    MathUtils,
    Mesh,
    ShadowMaterial,
  } from 'three';
  import { getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';

  let {
    type = 'directional',
    azimuth = 315,
    altitude = 45,
    intensity = 1,
    color = 'white',
    shadow = false,
  }: LightProps = $props();

  const ctx = getChartContext();
  const scene = getSceneContext();

  // A scene with a light of its own turns off its built-in lights
  scene.lights += 1;

  // Lambert shading divides by π, so this many π light a face head on at its full color
  const light = $derived(type === 'ambient' ? new AmbientLight() : new DirectionalLight());

  /** Shows the shadows falling on the floor, and nothing else */
  const floor = new Mesh(new BufferGeometry(), new ShadowMaterial({ opacity: 0.25 }));
  floor.receiveShadow = true;

  $effect(() => {
    const current = light;
    // The scene's root is offset to center the plot, so lights and their targets go under it
    scene.root.add(current);
    if (current instanceof DirectionalLight) scene.root.add(current.target);
    return () => {
      scene.root.remove(current);
      if (current instanceof DirectionalLight) scene.root.remove(current.target);
      current.dispose();
      scene.invalidate();
    };
  });

  $effect(() => {
    const current = light;
    current.intensity = intensity * Math.PI;
    const resolved = scene.color(color);
    if (resolved) current.color.copy(resolved.color);

    if (current instanceof DirectionalLight) {
      const width = ctx.width;
      const height = ctx.height;
      const depth = ctx.zDepth;
      const radius = Math.hypot(width, height, depth) / 2 || 1;
      const a = MathUtils.degToRad(azimuth);
      const h = MathUtils.degToRad(altitude);
      // From the plot's center towards the light, in chart terms: `y` runs down the plot, so
      // "towards the top edge" is `-y`
      const x = Math.sin(a) * Math.cos(h);
      const y = -Math.cos(a) * Math.cos(h);
      const up = Math.sin(h);
      current.target.position.set(width / 2, depth / 2, height / 2);
      current.position.set(
        width / 2 + x * radius * 2,
        depth / 2 + up * radius * 2,
        height / 2 + y * radius * 2
      );

      current.castShadow = shadow;
      if (shadow) {
        // A shadow map just covering the plot box, as seen from the light
        const camera = current.shadow.camera;
        camera.left = camera.bottom = -radius;
        camera.right = camera.top = radius;
        camera.near = radius * 0.5;
        camera.far = radius * 3.5;
        camera.updateProjectionMatrix();
        current.shadow.mapSize.set(2048, 2048);
        current.shadow.bias = -0.0005;
        current.shadow.normalBias = radius * 0.002;
        current.shadow.needsUpdate = true;
      }

      floor.geometry.dispose();
      floor.geometry = new BufferGeometry();
      floor.geometry.setAttribute(
        'position',
        new Float32BufferAttribute([0, 0, 0, width, 0, 0, 0, 0, height, width, 0, height], 3)
      );
      floor.geometry.setIndex([0, 2, 1, 1, 2, 3]);
      if (shadow) scene.root.add(floor);
      else scene.root.remove(floor);
    }
    scene.invalidate();
  });

  $effect(() => {
    return () => {
      scene.lights -= 1;
      scene.root.remove(floor);
      floor.geometry.dispose();
      floor.material.dispose();
      scene.invalidate();
    };
  });
</script>
