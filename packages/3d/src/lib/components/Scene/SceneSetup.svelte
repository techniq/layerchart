<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { fromStore } from 'svelte/store';
  import { useCamera, useThrelte } from '@threlte/core';
  import {
    AmbientLight,
    DirectionalLight,
    MathUtils,
    MOUSE,
    TOUCH,
    OrthographicCamera,
    PerspectiveCamera,
    Raycaster,
    Vector2,
    Vector3,
  } from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { getChartContext, type ScrollActivationKey } from 'layerchart';
  import { createControlledMotion, type MotionOptions } from 'layerchart/utils/motion.svelte';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import {
    fitOrthographic,
    fitPerspective,
    viewAngles,
    viewDirection,
  } from '../../utils/camera.js';
  import { getSphere } from '../../utils/globe.js';

  let {
    camera: cameraType,
    rotate = $bindable(),
    tilt = $bindable(),
    fov,
    margin,
    controls,
    drag,
    motion,
    scrollActivationKey,
    children,
  }: {
    camera: 'perspective' | 'orthographic';
    rotate: number;
    tilt: number;
    fov: number;
    margin: number;
    controls: boolean;
    drag: 'rotate' | 'pan';
    motion?: MotionOptions;
    scrollActivationKey?: ScrollActivationKey;
    children?: Snippet;
  } = $props();

  const ctx = getChartContext();
  const sceneState = getSceneContext();
  const { scene, renderer, invalidate, size: sizeStore } = useThrelte();
  const cameraContext = useCamera();
  const size = fromStore(sizeStore);

  sceneState.invalidate = invalidate;
  scene.add(sceneState.root);

  // Leaving the page (or scrolling far off it), let the browser have the WebGL context back now,
  // rather than whenever it collects the canvas
  $effect(() => {
    return () => {
      renderer.dispose();
      (renderer as { forceContextLoss?: () => void }).forceContextLoss?.();
    };
  });

  // Even light all round, plus a key light from above and to the left of the camera (it moves
  // with it) so faces turned different ways read apart.  Lambert shading divides by π, so these
  // add to a face lit head on at its full color.
  // These are the scene's own, until it has a `Light`.
  const ambientLight = new AmbientLight(0xffffff, Math.PI * 0.6);
  scene.add(ambientLight);
  const keyLight = new DirectionalLight(0xffffff, Math.PI * 0.45);
  $effect(() => {
    ambientLight.visible = keyLight.visible = sceneState.lights === 0;
    invalidate();
  });

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

  /**
   * Where the user has zoomed and panned to, from the fitted view: kept when the plot box changes
   * (ex. a taller `zRange`), so refitting doesn't undo them.  `reset` puts them back.
   */
  const fitTarget = new Vector3();
  const panOffset = new Vector3();
  /** The camera's distance over the fitted distance (perspective), or its zoom (orthographic) */
  let zoom = 1;

  /** Let the user zoom out a few times past the fitted view, but not past the far plane */
  function limitZoom(controls: OrbitControls) {
    controls.maxDistance = fitted * 5;
    controls.minZoom = 0.2;
  }

  /** Point the camera along `direction` from far enough away to see the whole plot box */
  function fit() {
    const { width, height } = size.current;
    if (!width || !height) return;
    // The plot box, or the chart's `globe` (and room for anything raised off it), which looks the
    // same size from every side so is fitted by its radius
    const sphere = getSphere(ctx);
    const box = { width: ctx.width, height: ctx.height, depth: ctx.zDepth };
    const radius = sphere ? sphere.radius + ctx.zDepth : null;
    const aspect = width / height;

    // The plot's floor centered, and the camera on the middle of the box or the globe
    sceneState.root.position.set(-ctx.width / 2, 0, -ctx.height / 2);
    if (sphere) {
      const [x, up, y] = sphere.center;
      target.set(x - ctx.width / 2, up, y - ctx.height / 2);
    } else {
      target.set(0, ctx.zDepth / 2, 0);
    }

    const cam = camera;
    let distance: number;
    if (cam instanceof PerspectiveCamera) {
      const vertical = MathUtils.degToRad(viewFov) / 2;
      const horizontal = Math.atan(Math.tan(vertical) * aspect);
      distance =
        (radius != null
          ? radius / Math.sin(Math.min(vertical, horizontal))
          : fitPerspective(box, direction, viewFov, aspect)) *
        (1 + margin);
      // An empty plot box (no room inside the padding) leaves nothing to fit
      if (!(distance > 0)) return;
      cam.fov = viewFov;
      cam.aspect = aspect;
      cam.near = distance / 100;
      cam.far = distance * 10;
    } else {
      const { halfWidth, halfHeight } =
        radius != null
          ? aspect >= 1
            ? { halfWidth: radius * aspect, halfHeight: radius }
            : { halfWidth: radius, halfHeight: radius / aspect }
          : fitOrthographic(box, direction, aspect);
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
    fitted = distance;
    fitTarget.copy(target);
    // Then wherever the user zoomed and panned to
    target.add(panOffset);
    if (cam instanceof PerspectiveCamera) distance *= zoom;
    else cam.zoom = zoom;
    cam.position.copy(direction).multiplyScalar(distance).add(target);
    cam.up.set(0, 1, 0);
    cam.lookAt(target);
    cam.updateProjectionMatrix();
    keyLight.position.set(-0.5, 1, 0).multiplyScalar(distance);

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
  /** Whether `rotate` / `tilt` are where orbiting put them (`rotate` the same turn, any way round) */
  const isOrbited = (r: number, t: number) =>
    !!orbited && Math.abs((r - orbited.rotate) % 360) < 1e-9 && orbited.tilt === t;

  // A new `rotate`, `tilt`, or `fov` eases there with `motion` (orbiting moves the view itself, so
  // its angles land at once)
  // The motion is fixed when the scene mounts, as a mark's `motion` is
  const view = untrack(() =>
    motion ? createControlledMotion<number[]>([rotate, tilt, fov], motion) : null
  );
  $effect.pre(() => {
    const next = [rotate, tilt, fov];
    if (!view) return;
    untrack(() => {
      // The short way round
      const from = view.current[0];
      next[0] = from + ((((next[0] - from) % 360) + 540) % 360) - 180;
      if (isOrbited(next[0], next[1])) {
        view.set(next, view.type === 'tween' ? { duration: 0 } : ({ instant: true } as any));
      } else {
        view.set(next);
      }
    });
  });
  const shown = $derived(view ? view.current : [rotate, tilt, fov]);
  /** The field of view the camera is fitted with, eased with the angles */
  let viewFov = untrack(() => fov);

  // A new view turns the camera, but leaves where a user orbited to alone otherwise
  $effect.pre(() => {
    const [r, t, f] = shown;
    const fovChanged = f !== viewFov;
    viewFov = f;
    // Orbiting reports where the camera already is, and refitting would undo a zoom
    if (!fovChanged && isOrbited(r, t)) return;
    viewDirection(r, t, direction);
    untrack(fit);
  });

  $effect.pre(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    [ctx.width, ctx.height, ctx.zDepth, size.current, margin, camera];
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ctx.geo.projection;
    untrack(fit);
  });

  $effect(() => {
    if (!controls) return;
    const cam = camera;
    const orbitControls = new OrbitControls(cam, renderer.domElement);
    // No further than edge on: charts read from above the floor, and walls and axes assume it
    orbitControls.maxPolarAngle = Math.PI / 2;
    const pan = untrack(() => drag) === 'pan';
    orbitControls.mouseButtons.LEFT = pan ? MOUSE.PAN : MOUSE.ROTATE;
    orbitControls.touches.ONE = pan ? TOUCH.PAN : TOUCH.ROTATE;
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
      // Zooming and panning, kept across refits
      panOffset.copy(orbitControls.target).sub(fitTarget);
      zoom = cam instanceof PerspectiveCamera ? offset.length() / (fitted || 1) : cam.zoom;
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

  // A plain drag (and one finger) turns the view or pans it; shift-drag does the other
  $effect(() => {
    const pan = drag === 'pan';
    if (!orbit) return;
    orbit.mouseButtons.LEFT = pan ? MOUSE.PAN : MOUSE.ROTATE;
    orbit.touches.ONE = pan ? TOUCH.PAN : TOUCH.ROTATE;
  });

  /** The view the scene started with, for `reset` */
  const initial = untrack(() => ({ rotate, tilt }));

  /** The frame of an animation in flight, to cancel when another starts */
  let animation = 0;
  /** Run `step` with an eased `t` from 0 to 1 over `duration` milliseconds */
  function animate(duration: number, step: (t: number) => void) {
    cancelAnimationFrame(animation);
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Cubic in-out, as a flat chart's transform eases
      step(t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
      if (t < 1) animation = requestAnimationFrame(frame);
    };
    animation = requestAnimationFrame(frame);
  }

  const clampZoom = (value: number) =>
    camera instanceof PerspectiveCamera
      ? Math.min(5, Math.max(0.05, value))
      : Math.min(20, Math.max(0.2, value));

  sceneState.zoomBy = (factor, eased = true) => {
    // Closer is a shorter distance for a perspective camera, and more zoom for an orthographic one
    const to = clampZoom(camera instanceof PerspectiveCamera ? zoom * factor : zoom / factor);
    if (!eased) {
      zoom = to;
      fit();
      return;
    }
    const from = zoom;
    animate(300, (t) => {
      zoom = from + (to - from) * t;
      fit();
    });
  };

  sceneState.resetView = () => {
    // Back from any zoom or pan, and round to the angles it started at
    const fromDirection = direction.clone();
    const toDirection = viewDirection(initial.rotate, initial.tilt, new Vector3());
    const fromPan = panOffset.clone();
    const fromZoom = zoom;
    orbited = { rotate: initial.rotate, tilt: initial.tilt };
    animate(500, (t) => {
      direction.lerpVectors(fromDirection, toDirection, t).normalize();
      panOffset.lerpVectors(fromPan, new Vector3(), t);
      zoom = fromZoom + (1 - fromZoom) * t;
      fit();
      if (t === 1) {
        rotate = initial.rotate;
        tilt = initial.tilt;
      }
    });
  };

  // As on a flat chart's `transform`, scrolling only zooms with `scrollActivationKey` held, and
  // otherwise scrolls the page.  Caught on the way down, before it reaches the controls.
  $effect(() => {
    const key = scrollActivationKey;
    const container = renderer.domElement.parentElement;
    if (!key || !container) return;
    const onWheel = (e: WheelEvent) => {
      // Either way, not the controls': without the key the page scrolls, and with it the scene
      // zooms here, since some keys change the wheel (shift turns it sideways on macOS, which the
      // controls don't read)
      e.stopPropagation();
      const held = { meta: e.metaKey, alt: e.altKey, control: e.ctrlKey, shift: e.shiftKey }[key];
      if (!held) return;
      e.preventDefault();
      const delta = e.deltaY || e.deltaX;
      if (delta) sceneState.zoomBy(Math.pow(1.002, delta), false);
    };
    container.addEventListener('wheel', onWheel, { capture: true, passive: false });
    return () => container.removeEventListener('wheel', onWheel, { capture: true });
  });

  // Tooltips: the row under the pointer, from whichever mark it hits first
  const raycaster = new Raycaster();
  // Lines (ex. `Spline`) are hit within a few pixels of them, as thin ones are hard to land on
  raycaster.params.Line2 = { threshold: 8 };
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
