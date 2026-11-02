<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { fromStore } from 'svelte/store';
  import { useCamera, useThrelte } from '@threlte/core';
  import {
    AmbientLight,
    DirectionalLight,
    MathUtils,
    OrthographicCamera,
    PerspectiveCamera,
    Raycaster,
    Vector2,
    Vector3,
  } from 'three';
  import { getChartContext } from 'layerchart';
  import { createControlledMotion } from 'layerchart/utils/motion.svelte';

  import { getSceneContext } from '../../contexts/scene.svelte.js';
  import { frameOrthographic, framePerspective, viewDirection } from '../../utils/camera.js';
  import { geoPath } from 'd3-geo';
  import { getSphere } from '../../utils/globe.js';

  let { children }: { children?: Snippet } = $props();

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
  // Flat (no `view`, seen from directly above), marks are drawn in their own colors, unshaded: a
  // full ambient light alone
  $effect(() => {
    const own = sceneState.lights === 0;
    const flat = !ctx.view;
    ambientLight.visible = own;
    ambientLight.intensity = flat ? Math.PI : Math.PI * 0.6;
    keyLight.visible = own && !flat;
    invalidate();
  });

  /**
   * How the chart is seen: through its `perspective` or `orthographic` view (an `isometric` one is
   * orthographic too), else from directly above
   */
  const view = $derived(ctx.view);
  const camera = $derived(
    view?.type === 'perspective' ? new PerspectiveCamera() : new OrthographicCamera()
  );
  /** Room around the plot box when fitting it */
  const margin = $derived((view?.options as { margin?: number } | undefined)?.margin ?? 0.1);
  /** The angles the camera looks from: the view's, or the transform's while it turns the view */
  const angles = $derived(view ? ctx.viewRotation : { rotate: 0, tilt: 0 });
  /**
   * The view's own angles, which the plot box is framed for.  A drag turns the camera about that
   * frame, as orbit controls turn about their target, rather than reframing as it goes.
   */
  const framedAngles = $derived(view ? ctx.viewAngles : { rotate: 0, tilt: 0 });
  const fov = $derived(view?.type === 'perspective' ? (view.options.fov ?? 35) : 35);

  // A new `fov` eases with the view's `motion`, as its angles do (fixed when the scene mounts)
  const fovMotion = untrack(() => {
    const motion = view?.options.motion;
    return motion ? createControlledMotion(fov, motion) : null;
  });
  $effect.pre(() => {
    const next = fov;
    untrack(() => fovMotion?.set(next));
  });
  const shownFov = $derived(fovMotion ? fovMotion.current : fov);

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

  /** From the plot towards the camera: where the camera is turned to */
  const direction = new Vector3();
  /** From the plot towards the camera, for the view's own angles: what it's framed for */
  const framedDirection = new Vector3();
  /** What the fitted camera looks at: the middle of the plot box, or of the globe */
  const fitTarget = new Vector3();
  /** How far the fitted camera is from `fitTarget` */
  let fitDistance = 0;
  /** At `fitTarget`'s depth, how far a pixel of the layer reaches in the fitted view */
  let fitUnit = 1;
  /**
   * Where the transform has panned the camera's target to, from `fitTarget`, in the scene: kept
   * as the view turns, so it turns about what the user panned to
   */
  const pan = new Vector3();
  /** The transform last folded into `pan` */
  let applied = { scale: 1, x: 0, y: 0 };

  /** The chart's `canvas` pan and zoom, or none */
  function panZoomState() {
    const transform = ctx.transform;
    return transform.mode === 'canvas'
      ? { scale: transform.scale, x: transform.translate.x, y: transform.translate.y }
      : { scale: 1, x: 0, y: 0 };
  }

  /**
   * The part of the floor that's drawn on, `[[x0, y0], [x1, y1]]` in chart pixels: a map's
   * `fitGeojson` as projected, else the whole plot
   */
  function floorBounds(): [[number, number], [number, number]] {
    const whole: [[number, number], [number, number]] = [
      [0, 0],
      [ctx.width, ctx.height],
    ];
    const projection = ctx.geo.projection;
    const fitted = (ctx.props.geo as { fitGeojson?: unknown } | undefined)?.fitGeojson;
    if (!projection || !fitted) return whole;
    const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(fitted as any);
    if (![x0, y0, x1, y1].every(Number.isFinite) || !(x1 > x0) || !(y1 > y0)) return whole;
    return [
      [Math.max(0, x0), Math.max(0, y0)],
      [Math.min(ctx.width, x1), Math.min(ctx.height, y1)],
    ];
  }

  /** Fit the camera along `direction` to see the whole plot box, then place it */
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
      fitTarget.set(x - ctx.width / 2, up, y - ctx.height / 2);
    } else {
      fitTarget.set(0, ctx.zDepth / 2, 0);
    }

    const cam = camera;
    if (!view && cam instanceof OrthographicCamera) {
      // Flat: straight down on the floor, each chart pixel on a pixel of the layer, where a flat
      // layer would draw it (so `Svg` / `Html` layers line up over it)
      const { left, top } = ctx.padding;
      const distance = Math.max(box.width, box.height, box.depth, 1) * 2;
      fitTarget.set(0, 0, 0);
      Object.assign(cam, {
        left: -(left + ctx.width / 2),
        right: width - left - ctx.width / 2,
        top: top + ctx.height / 2,
        bottom: -(height - top - ctx.height / 2),
        near: 0.1,
        far: distance * 4,
        zoom: 1,
      });
      cam.position.set(0, distance, 0);
      // Up the screen is up the plot (towards its far edge)
      cam.up.set(0, 0, -1);
      cam.lookAt(fitTarget);
      panZoomFlat();
      sceneState.width = width;
      sceneState.height = height;
      moved();
      return;
    }
    cam.clearViewOffset();
    // What's drawn: a map's own bounds on the floor (it rarely fills the plot), else the plot box
    const floor = floorBounds();
    const min = new Vector3(floor[0][0] - ctx.width / 2, 0, floor[0][1] - ctx.height / 2);
    const max = new Vector3(floor[1][0] - ctx.width / 2, box.depth, floor[1][1] - ctx.height / 2);
    if (cam instanceof PerspectiveCamera) {
      const vertical = MathUtils.degToRad(shownFov) / 2;
      const horizontal = Math.atan(Math.tan(vertical) * aspect);
      let distance: number;
      if (radius != null) {
        distance = (radius / Math.sin(Math.min(vertical, horizontal))) * (1 + margin);
      } else {
        // Framed in a field of view narrowed by the margin, so there's that much room around it
        const narrowed = MathUtils.radToDeg(2 * Math.atan(Math.tan(vertical) / (1 + margin)));
        const framed = framePerspective(min, max, framedDirection, narrowed, aspect);
        fitTarget.copy(framed.target);
        distance = framed.distance;
      }
      // An empty plot box (no room inside the padding) leaves nothing to fit
      if (!(distance > 0)) return;
      cam.fov = shownFov;
      cam.aspect = aspect;
      fitDistance = distance;
      fitUnit = (2 * distance * Math.tan(vertical)) / height;
    } else {
      let halfWidth: number;
      let halfHeight: number;
      if (radius != null) {
        ({ halfWidth, halfHeight } =
          aspect >= 1
            ? { halfWidth: radius * aspect, halfHeight: radius }
            : { halfWidth: radius, halfHeight: radius / aspect });
      } else {
        const framed = frameOrthographic(min, max, framedDirection, aspect);
        fitTarget.copy(framed.target);
        ({ halfWidth, halfHeight } = framed);
      }
      if (!(halfWidth > 0 && halfHeight > 0)) return;
      const scale = 1 + margin;
      fitDistance = Math.hypot(box.width, box.height, box.depth) * 2;
      Object.assign(cam, {
        left: -halfWidth * scale,
        right: halfWidth * scale,
        top: halfHeight * scale,
        bottom: -halfHeight * scale,
        near: 0.1,
        far: fitDistance * 4,
      });
      fitUnit = (2 * halfHeight * scale) / height;
    }
    sceneState.width = width;
    sceneState.height = height;
    place();
  }

  /**
   * Put the camera at the panned target, turned along `direction`: moved in by the zoom (as
   * dollying in, for a perspective camera), as far as it was fitted
   */
  function place() {
    const cam = camera;
    const { scale } = panZoomState();
    const target = fitTarget.clone().add(pan);
    let distance = fitDistance;
    if (cam instanceof PerspectiveCamera) {
      distance = fitDistance / scale;
      cam.near = distance / 100;
      cam.far = Math.max(distance, fitDistance) * 10;
    } else if (cam instanceof OrthographicCamera) {
      cam.zoom = scale;
    }
    cam.position.copy(direction).multiplyScalar(distance).add(target);
    cam.up.set(0, 1, 0);
    cam.lookAt(target);
    cam.updateProjectionMatrix();
    keyLight.position.set(-0.5, 1, 0).multiplyScalar(fitDistance);
    moved();
  }

  /**
   * Where a pan and zoom put the camera's target, from `fitTarget`, along the camera's right and
   * down: so a point at the target's depth lands where the transform puts it on a flat layer (`t +
   * k * p`), which keeps it under the pointer as it zooms
   */
  function panOffset({ scale: k, x, y }: { scale: number; x: number; y: number }) {
    const { width, height } = size.current;
    const { left, top } = ctx.padding;
    const unit = fitUnit / k;
    return {
      right: -unit * (x + (1 - k) * (left - width / 2)),
      down: -unit * (y + (1 - k) * (top - height / 2)),
    };
  }

  const right = new Vector3();
  const up = new Vector3();
  /**
   * Fold a new pan / zoom into `pan`: the change, along the camera's axes as it's turned now, so
   * an earlier pan stays where it was in the scene however the view has turned since
   */
  function applyPanZoom() {
    const next = panZoomState();
    if (next.scale === 1 && next.x === 0 && next.y === 0) {
      // Back where it started (ex. `reset()`)
      pan.set(0, 0, 0);
    } else {
      const from = panOffset(applied);
      const to = panOffset(next);
      camera.updateMatrixWorld();
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      up.setFromMatrixColumn(camera.matrixWorld, 1);
      pan.addScaledVector(right, to.right - from.right);
      pan.addScaledVector(up, -(to.down - from.down));
    }
    applied = next;
  }

  /**
   * Flat, the chart's `canvas` pan and zoom over the scene as drawn, exactly as over a flat layer:
   * the camera draws the part of its view the transform brings into the layer
   */
  function panZoomFlat() {
    const cam = camera;
    const { width, height } = size.current;
    const { scale: k, x, y } = panZoomState();
    if (k === 1 && x === 0 && y === 0) {
      cam.clearViewOffset();
    } else {
      // A flat layer's point `p` (from the plot's corner) lands at `t + k * p`
      const { left, top } = ctx.padding;
      cam.setViewOffset(
        width,
        height,
        left - (left + x) / k,
        top - (top + y) / k,
        width / k,
        height / k
      );
    }
    cam.updateProjectionMatrix();
  }

  /** Let labels re-project and walls / axes move to the sides away from the camera */
  function moved() {
    camera.updateMatrixWorld();
    const local = camera.position.clone().sub(sceneState.root.position);
    // Flat, the camera is over the middle: the far sides are the top and right, as on a flat chart
    const far = view
      ? ({
          x: local.x > ctx.width / 2 ? 'min' : 'max',
          y: local.z > ctx.height / 2 ? 'min' : 'max',
        } as const)
      : ({ x: 'max', y: 'min' } as const);
    untrack(() => {
      if (far.x !== sceneState.far.x || far.y !== sceneState.far.y) sceneState.far = far;
      sceneState.cameraVersion += 1;
    });
    invalidate();
  }

  // A new view, or the plot box changing, refits the camera
  $effect.pre(() => {
    const { rotate, tilt } = framedAngles;
    viewDirection(rotate, tilt, framedDirection);
    untrack(() => viewDirection(angles.rotate, angles.tilt, direction));
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    [ctx.width, ctx.height, ctx.zDepth, size.current, margin, camera, shownFov];
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ctx.geo.projection;
    untrack(fit);
  });

  // Turning (ex. a drag) moves the camera round what it's framed on
  $effect.pre(() => {
    const { rotate, tilt } = angles;
    viewDirection(rotate, tilt, direction);
    untrack(() => {
      if (sceneState.width && view) place();
    });
  });

  // Panning moves the camera's target, and zooming moves the camera in (or, flat, both only move
  // what's drawn)
  $effect.pre(() => {
    const transform = ctx.transform;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    [transform.mode, transform.scale, transform.translate.x, transform.translate.y];
    untrack(() => {
      if (!sceneState.width) return;
      if (!view) {
        panZoomFlat();
        moved();
        return;
      }
      applyPanZoom();
      place();
    });
  });

  // Tooltips: the row under the pointer, from whichever mark it hits first
  const raycaster = new Raycaster();
  // Lines (ex. `Spline`) are hit within a few pixels of them, as thin ones are hard to land on
  raycaster.params.Line2 = { threshold: 8 };
  const pointer = new Vector2();

  $effect(() => {
    const element = renderer.domElement;
    const onPointerMove = (e: PointerEvent) => {
      // A drag turns or pans the view
      if (e.buttons || ctx.transform.dragging) {
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
