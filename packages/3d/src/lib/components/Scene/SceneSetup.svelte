<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { fromStore } from 'svelte/store';
  import { useCamera, useThrelte } from '@threlte/core';
  import {
    AmbientLight,
    DirectionalLight,
    OrthographicCamera,
    PerspectiveCamera,
    Raycaster,
    Vector2,
    Vector3,
  } from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { getChartContext } from 'layerchart';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import {
    fitOrthographic,
    fitPerspective,
    viewAngles,
    viewDirection,
  } from '../../utils/camera.js';

  let {
    camera: cameraType,
    rotate = $bindable(),
    tilt = $bindable(),
    fov,
    margin,
    controls,
    children,
  }: {
    camera: 'perspective' | 'orthographic';
    rotate: number;
    tilt: number;
    fov: number;
    margin: number;
    controls: boolean;
    children?: Snippet;
  } = $props();

  const ctx = getChartContext();
  const sceneState = getSceneContext();
  const { scene, renderer, invalidate, size: sizeStore } = useThrelte();
  const cameraContext = useCamera();
  const size = fromStore(sizeStore);

  sceneState.invalidate = invalidate;
  scene.add(sceneState.root);

  // Even light all round, plus a key light from above and to the left of the camera (it moves
  // with it) so faces turned different ways read apart.  Lambert shading divides by π, so these
  // add to a face lit head on at its full color.
  scene.add(new AmbientLight(0xffffff, Math.PI * 0.6));
  const keyLight = new DirectionalLight(0xffffff, Math.PI * 0.45);

  const camera = $derived(
    cameraType === 'orthographic' ? new OrthographicCamera() : new PerspectiveCamera()
  );

  $effect.pre(() => {
    const cam = camera;
    scene.add(cam);
    cam.add(keyLight);
    cameraContext.makeDefaultCameras.add(cam);
    cameraContext.camera.set(cam);
    sceneState.camera = cam;
    return () => {
      cameraContext.makeDefaultCameras.delete(cam);
      cam.remove(keyLight);
      scene.remove(cam);
    };
  });

  /** From the plot's center towards the camera; set by `rotate` / `tilt`, then by orbiting */
  const direction = new Vector3();
  const target = new Vector3();
  let orbit: OrbitControls | null = null;
  /** How far `fit` last put the camera, which zooming out may go a few times past */
  let fitted = 0;
  /** While `fit` updates the controls, whose `change` would report its own move as an orbit */
  let fitting = false;

  /** Let the user zoom out a few times past the fitted view, but not past the far plane */
  function limitZoom(controls: OrbitControls) {
    controls.maxDistance = fitted * 5;
    controls.minZoom = 0.2;
  }

  /** Point the camera along `direction` from far enough away to see the whole plot box */
  function fit() {
    const { width, height } = size.current;
    if (!width || !height) return;
    const box = { width: ctx.width, height: ctx.height, depth: ctx.zDepth };
    const aspect = width / height;

    sceneState.root.position.set(-box.width / 2, 0, -box.height / 2);
    target.set(0, box.depth / 2, 0);

    const cam = camera;
    let distance: number;
    if (cam instanceof PerspectiveCamera) {
      distance = fitPerspective(box, direction, fov, aspect) * (1 + margin);
      // An empty plot box (no room inside the padding) leaves nothing to fit
      if (!(distance > 0)) return;
      cam.fov = fov;
      cam.aspect = aspect;
      cam.near = distance / 100;
      cam.far = distance * 10;
    } else {
      const { halfWidth, halfHeight } = fitOrthographic(box, direction, aspect);
      if (!(halfWidth > 0 && halfHeight > 0)) return;
      const scale = 1 + margin;
      distance = Math.hypot(box.width, box.height, box.depth) * 2;
      Object.assign(cam, {
        left: -halfWidth * scale,
        right: halfWidth * scale,
        top: halfHeight * scale,
        bottom: -halfHeight * scale,
        near: 0.1,
        far: distance * 4,
        zoom: 1,
      });
    }
    cam.position.copy(direction).multiplyScalar(distance).add(target);
    cam.up.set(0, 1, 0);
    cam.lookAt(target);
    cam.updateProjectionMatrix();
    keyLight.position.set(-0.5, 1, 0).multiplyScalar(distance);

    fitted = distance;
    if (orbit) {
      limitZoom(orbit);
      orbit.target.copy(target);
      fitting = true;
      orbit.update();
      fitting = false;
    }
    sceneState.width = width;
    sceneState.height = height;
    moved();
  }

  /** Let labels re-project and walls / axes move to the sides away from the camera */
  function moved() {
    camera.updateMatrixWorld();
    const local = camera.position.clone().sub(sceneState.root.position);
    const far = {
      x: local.x > ctx.width / 2 ? 'min' : 'max',
      y: local.z > ctx.height / 2 ? 'min' : 'max',
    } as const;
    untrack(() => {
      if (far.x !== sceneState.far.x || far.y !== sceneState.far.y) sceneState.far = far;
      sceneState.cameraVersion += 1;
    });
    invalidate();
  }

  /** The angles orbiting last handed back through `bind:rotate` / `bind:tilt` */
  let orbited: { rotate: number; tilt: number } | null = null;

  // A new `rotate` / `tilt` turns the view, but leaves where a user orbited to alone otherwise
  $effect.pre(() => {
    // Orbiting reports where the camera already is, and refitting would undo a zoom
    if (orbited && orbited.rotate === rotate && orbited.tilt === tilt) return;
    viewDirection(rotate, tilt, direction);
    untrack(fit);
  });

  $effect.pre(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    [ctx.width, ctx.height, ctx.zDepth, size.current, fov, margin, camera];
    untrack(fit);
  });

  $effect(() => {
    if (!controls) return;
    const cam = camera;
    const orbitControls = new OrbitControls(cam, renderer.domElement);
    // No further than edge on: charts read from above the floor, and walls and axes assume it
    orbitControls.maxPolarAngle = Math.PI / 2;
    limitZoom(orbitControls);
    orbitControls.target.copy(target);
    fitting = true;
    orbitControls.update();
    fitting = false;
    const onChange = () => {
      if (fitting) return;
      const offset = cam.position.clone().sub(orbitControls.target);
      // At the target there's no direction to read
      if (offset.lengthSq() === 0) return;
      direction.copy(offset).normalize();
      orbited = viewAngles(direction);
      rotate = orbited.rotate;
      tilt = orbited.tilt;
      moved();
    };
    orbitControls.addEventListener('change', onChange);
    orbit = orbitControls;
    return () => {
      orbitControls.removeEventListener('change', onChange);
      orbitControls.dispose();
      orbit = null;
    };
  });

  // Tooltips: the row under the pointer, from whichever mark it hits first
  const raycaster = new Raycaster();
  const pointer = new Vector2();

  $effect(() => {
    const element = renderer.domElement;
    const onPointerMove = (e: PointerEvent) => {
      // A drag orbits the camera
      if (e.buttons) {
        ctx.tooltip.hide(e);
        return;
      }
      const rect = element.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
      const pickables = [...sceneState.pickables];
      const [hit] = raycaster.intersectObjects(
        pickables.map((p) => p.object),
        false
      );
      const datum = hit ? pickables.find((p) => p.object === hit.object)?.datum(hit) : undefined;
      if (datum != null) ctx.tooltip.show(e, datum);
      else ctx.tooltip.hide(e);
    };
    const onPointerLeave = (e: PointerEvent) => ctx.tooltip.hide(e);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerleave', onPointerLeave);
    return () => {
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', onPointerLeave);
    };
  });
</script>

{@render children?.()}
