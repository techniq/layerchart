<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { fromStore } from 'svelte/store';
  import { useCamera, useThrelte } from '@threlte/core';
  import {
    AmbientLight,
    DirectionalLight,
    Euler,
    MathUtils,
    OrthographicCamera,
    PerspectiveCamera,
    Plane,
    Quaternion,
    Raycaster,
    type Mesh,
    type Object3D,
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
  // rather than whenever it collects the canvas.  A new one shows nothing until it's fitted.
  $effect(() => {
    return () => {
      sceneState.fitted = false;
      renderer.dispose();
      (renderer as { forceContextLoss?: () => void }).forceContextLoss?.();
    };
  });

  // Clipped to the plot box's sides (as `Svg` clips to the plot), each a half pixel out so what's
  // on its edges (ex. axis lines) stays.  The root stands the plot's `(0, 0)` corner at
  // `(-width / 2, -height / 2)`, chart `y` along the scene's `z`.  Each material is clipped,
  // rather than the whole render, so what's marked `unclipped` (ex. an axis' labels) isn't.
  const clipPlanes = [
    new Plane(new Vector3(1, 0, 0)),
    new Plane(new Vector3(-1, 0, 0)),
    new Plane(new Vector3(0, 0, 1)),
    new Plane(new Vector3(0, 0, -1)),
  ];
  $effect(() => {
    const { width, height } = ctx;
    sceneState.plot = { width, height };
    clipPlanes[0].constant = clipPlanes[1].constant = width / 2 + 0.5;
    clipPlanes[2].constant = clipPlanes[3].constant = height / 2 + 0.5;
    invalidate();
  });
  renderer.localClippingEnabled = true;
  /** Clip `object`'s materials, and its children's, unless they're kept from it */
  function clip(object: Object3D, planes: Plane[] | null) {
    if (object.userData.unclipped) planes = null;
    const material = (object as Mesh).material;
    if (material) {
      for (const m of Array.isArray(material) ? material : [material]) m.clippingPlanes = planes;
    }
    for (const child of object.children) clip(child, planes);
  }
  scene.onBeforeRender = () => clip(sceneState.root, sceneState.clip ? clipPlanes : null);

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
  // Flat, marks cover each other in the order they're declared, as in an `Svg` or `Canvas` layer
  $effect.pre(() => sceneState.stack(!view));
  const camera = $derived(
    view?.type === 'perspective' ? new PerspectiveCamera() : new OrthographicCamera()
  );
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
    // Fitted here as the canvas resizes (see `fit`), so Threlte mustn't reset it to fill the canvas:
    // it would draw a frame unfitted (ex. as the canvas first takes its size)
    cameraContext.manual.set(true);
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
  /**
   * What the view turns about: the middle of what's framed (the plot box, a map's bounds, or the
   * globe), which stays where it is on screen as a drag turns the view
   */
  const fitCenter = new Vector3();
  /** How far the fitted camera is from `fitTarget` */
  let fitDistance = 0;
  /** The globe's radius (with room for anything raised off it) when there's one, else `0` */
  let fitRadius = 0;
  /** The globe's own radius, its surface, when there's one */
  let globeRadius = 0;
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
   * `fitGeojson` as projected, else what the `x` and `y` scales cover (ex. a square in the middle
   * of a wide plot, for `xRange` / `yRange` keeping it round), else the whole plot
   */
  function floorBounds(): [[number, number], [number, number]] {
    const clamp = ([[x0, y0], [x1, y1]]: number[][]): [[number, number], [number, number]] => [
      [Math.max(0, x0), Math.max(0, y0)],
      [Math.min(ctx.width, x1), Math.min(ctx.height, y1)],
    ];
    const valid = ([[x0, y0], [x1, y1]]: number[][]) =>
      [x0, y0, x1, y1].every(Number.isFinite) && x1 > x0 && y1 > y0;

    const projection = ctx.geo.projection;
    const fitted = (ctx.props.geo as { fitGeojson?: unknown } | undefined)?.fitGeojson;
    if (projection && fitted) {
      const bounds = geoPath(projection).bounds(fitted as any);
      if (valid(bounds)) return clamp(bounds);
    }
    if (!projection) {
      const xs = (ctx.xScale.range() as unknown[]).map(Number);
      const ys = (ctx.yScale.range() as unknown[]).map(Number);
      const bounds = [
        [Math.min(...xs), Math.min(...ys)],
        [Math.max(...xs), Math.max(...ys)],
      ];
      if (valid(bounds)) return clamp(bounds);
    }
    return [
      [0, 0],
      [ctx.width, ctx.height],
    ];
  }

  /** Fit the camera along `direction` to see the whole plot box, then place it */
  function fit() {
    zoomingAt = null;
    turningAbout = null;
    zoomedTo = null;
    grip = null;
    turnedFrom = { ...angles };
    const { width, height } = size.current;
    if (!width || !height) return;
    // The plot box, or the chart's `globe` (and room for anything raised off it), which looks the
    // same size from every side so is fitted by its radius
    const sphere = getSphere(ctx);
    const box = { width: ctx.width, height: ctx.height, depth: ctx.zDepth };
    const radius = sphere ? sphere.radius + ctx.zDepth : null;
    fitRadius = radius ?? 0;
    globeRadius = sphere?.radius ?? 0;
    // Fitted into the plot area, inside the chart's `padding`, as an `isometric` chart is (the
    // floor, `ctx.width` × `ctx.height`, is only as large as fits it at the view's `aspect`)
    const area = ctx.box;
    const aspect = area.width / area.height;

    // The plot's floor centered, and the camera on the middle of the box or the globe
    sceneState.root.position.set(-ctx.width / 2, 0, -ctx.height / 2);
    if (sphere) {
      const [x, up, y] = sphere.center;
      fitTarget.set(x - ctx.width / 2, up, y - ctx.height / 2);
    } else {
      fitTarget.set(0, ctx.zDepth / 2, 0);
    }
    fitCenter.copy(fitTarget);

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
      sceneState.unit = 1;
      panZoomFlat();
      sceneState.width = width;
      sceneState.height = height;
      moved();
      sceneState.fitted = true;
      return;
    }
    // No room inside the padding leaves nothing to fit
    if (!(area.width > 0 && area.height > 0)) return;
    // What's drawn: a map's own bounds on the floor (it rarely fills the plot), else the plot box
    const floor = floorBounds();
    const min = new Vector3(floor[0][0] - ctx.width / 2, 0, floor[0][1] - ctx.height / 2);
    const max = new Vector3(floor[1][0] - ctx.width / 2, box.depth, floor[1][1] - ctx.height / 2);
    if (radius == null) fitCenter.copy(min).add(max).multiplyScalar(0.5);
    if (cam instanceof PerspectiveCamera) {
      const vertical = MathUtils.degToRad(shownFov) / 2;
      const horizontal = Math.atan(Math.tan(vertical) * aspect);
      let distance: number;
      if (radius != null) {
        distance = radius / Math.sin(Math.min(vertical, horizontal));
      } else {
        const framed = framePerspective(min, max, framedDirection, shownFov, aspect);
        fitTarget.copy(framed.target);
        distance = framed.distance;
      }
      // An empty plot box (no room inside the padding) leaves nothing to fit
      if (!(distance > 0)) return;
      cam.fov = shownFov;
      cam.aspect = aspect;
      fitDistance = distance;
      fitUnit = (2 * distance * Math.tan(vertical)) / area.height;
      sceneState.unit = fitUnit;
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
      fitDistance = Math.hypot(box.width, box.height, box.depth) * 2;
      Object.assign(cam, {
        left: -halfWidth,
        right: halfWidth,
        top: halfHeight,
        bottom: -halfHeight,
        near: 0.1,
        far: fitDistance * 4,
      });
      fitUnit = (2 * halfHeight) / area.height;
      sceneState.unit = fitUnit;
    }
    // The view framed on the plot area, widened by the padding to the whole layer
    const { left, top } = ctx.padding;
    cam.setViewOffset(area.width, area.height, -left, -top, width, height);
    sceneState.width = width;
    sceneState.height = height;
    place();
    sceneState.fitted = true;
  }

  /**
   * Put the camera at the panned target, turned along `direction`: moved in by the zoom (as
   * dollying in, for a perspective camera), as far as it was fitted
   */
  function place() {
    const cam = camera;
    const { scale } = panZoomState();
    const target = lookingAt();
    let distance = fitDistance;
    if (cam instanceof PerspectiveCamera) {
      // Zooming in on a globe brings the camera down towards its surface, its height above it
      // divided by the zoom, so any zoom stays outside it (and comes close to the ground);
      // elsewhere, its distance from what it looks at
      distance = fitRadius ? fitRadius + (fitDistance - fitRadius) / scale : fitDistance / scale;
      // Near enough to see the ground close up, as the camera comes down to it
      cam.near = fitRadius ? Math.min(distance / 100, (distance - fitRadius) / 4) : distance / 100;
      cam.far = Math.max(distance, fitDistance) * 10;
    } else if (cam instanceof OrthographicCamera) {
      cam.zoom = scale;
    }
    turnRate(cam, distance);
    cam.position.copy(direction).multiplyScalar(distance).add(target);
    cam.up.set(0, 1, 0);
    cam.lookAt(target);
    cam.updateProjectionMatrix();
    keyLight.position.set(-0.5, 1, 0).multiplyScalar(fitDistance);
    moved();
  }

  /**
   * On a globe, how many degrees a drag of a pixel turns it, as the core flat globes turn:
   * across about the poles, down tipping them, the same wherever it's grabbed, 75° for a drag of
   * its radius on screen.  A little faster than the middle of the view moves, so ground away from
   * it (moving less as the globe turns) keeps up with the pointer too.  Its radius as the ground
   * in the middle of the view shows it, however close the camera has come.  Elsewhere, the chart's
   * usual rate.
   */
  function turnRate(cam: PerspectiveCamera | OrthographicCamera, distance: number) {
    let rate: number | null = null;
    const height = ctx.box.height;
    if (globeRadius && height > 0) {
      // Screen pixels a scene unit spans on the ground in the middle of the view: from the
      // camera's height above it (perspective), or anywhere (orthographic)
      const perUnit =
        cam instanceof PerspectiveCamera
          ? height / 2 / Math.tan(MathUtils.degToRad(cam.fov) / 2) / (distance - globeRadius)
          : (height * cam.zoom) / (cam.top - cam.bottom);
      if (perUnit > 0 && Number.isFinite(perUnit)) rate = 75 / (perUnit * globeRadius);
    }
    if (untrack(() => ctx._viewTurnRate) !== rate) ctx._viewTurnRate = rate;
  }

  /** What the camera looks at, in the scene, zoomed in by `scale` */
  function lookingAt(scale = panZoomState().scale) {
    // The framed view turned, camera and target together, about the middle of what's framed: so
    // that stays put on screen as the view turns, as orbit controls turn about what they look at.
    // (Framing centers what's framed on screen, which for a perspective camera can put the target
    // a little off its middle.)
    const turn = orientation(angles).multiply(orientation(framedAngles).invert());
    // Panned, it turns about what's been panned to: the middle moved by the pan
    const pivot = fitCenter.clone().add(pan);
    // Zoomed in, the camera, what it looks at, and what it turns about are all drawn in towards
    // where it zoomed (see `applyPanZoom`): so it turns as it does unzoomed, at any zoom, rather
    // than about somewhere far off beside it
    const shrink = camera instanceof PerspectiveCamera && !fitRadius ? 1 / scale : 1;
    return fitTarget.clone().sub(fitCenter).multiplyScalar(shrink).applyQuaternion(turn).add(pivot);
  }

  /** The turn taking straight up to the direction a view at `rotate` / `tilt` looks from */
  function orientation({ rotate, tilt }: { rotate: number; tilt: number }) {
    // As `viewDirection`: tipped by `tilt` from straight up, then turned by `rotate` about it
    const theta = MathUtils.degToRad(MathUtils.clamp(tilt, 0.01, 179.99));
    return new Quaternion().setFromEuler(new Euler(theta, MathUtils.degToRad(rotate), 0, 'YXZ'));
  }

  /**
   * Where a pan and zoom put the camera's target, from `fitTarget`, along the camera's right and
   * down: so a point at the target's depth lands where the transform puts it on a flat layer (`t +
   * k * p`), which keeps it under the pointer as it zooms
   */
  function panOffset({ scale: k, x, y }: { scale: number; x: number; y: number }) {
    // The target is framed in the middle of the plot area
    const unit = fitUnit / k;
    return {
      right: -unit * (x - ((1 - k) * ctx.box.width) / 2),
      down: -unit * (y - ((1 - k) * ctx.box.height) / 2),
    };
  }

  const right = new Vector3();
  const up = new Vector3();
  const zoomRaycaster = new Raycaster();
  const zoomPointer = new Vector2();
  const floor = new Plane(new Vector3(0, 1, 0), 0);

  /** The camera's ray through a point of the plot area on screen (in `zoomRaycaster`) */
  function rayAt(x: number, y: number) {
    const { width, height } = size.current;
    if (!width || !height) return null;
    zoomPointer.set(
      ((x + ctx.padding.left) / width) * 2 - 1,
      -((y + ctx.padding.top) / height) * 2 + 1
    );
    camera.updateMatrixWorld();
    zoomRaycaster.setFromCamera(zoomPointer, camera);
    return zoomRaycaster.ray;
  }

  /**
   * What a drag grabbed (what was under the pointer as it started), and where the drag started:
   * kept under the pointer as it pans on (and as it coasts on after, with `inertia`)
   */
  let grip: { x: number; y: number; tx: number; ty: number; point: Vector3 } | null = null;
  const gripPlane = new Plane();

  /**
   * A perspective view panned by a drag moves over the ground as a map's does: what it grabbed
   * stays under the pointer, at any zoom and however far off it is, and the camera stays as high.
   * (Panning by as much at every depth, things farther than what the camera looks at lag behind
   * the pointer.)  Whether it did: not for a pan that isn't a drag, or past the horizon.
   */
  function dragGround(next: { scale: number; x: number; y: number }) {
    if (!(camera instanceof PerspectiveCamera) || fitRadius || next.scale !== applied.scale) {
      return false;
    }
    const { startPoint: start, startTranslate: from, dragging } = ctx.transform;
    const { left, top } = ctx.padding;
    if (
      !grip ||
      grip.x !== start.x ||
      grip.y !== start.y ||
      grip.tx !== from.x ||
      grip.ty !== from.y
    ) {
      // Only a drag grabs, as it starts: the camera is still where it started
      const point = dragging ? surfaceAt(start.x - left, start.y - top) : null;
      grip = point ? { x: start.x, y: start.y, tx: from.x, ty: from.y, point } : null;
      if (!grip) return false;
    }
    // Where the pointer is now (or would be, coasting on), and the ground there at the height of
    // what was grabbed
    const ray = rayAt(start.x - left + next.x - grip.tx, start.y - top + next.y - grip.ty);
    gripPlane.set(new Vector3(0, 1, 0), -grip.point.y);
    const under = ray?.intersectPlane(gripPlane, new Vector3());
    if (!under) return false;
    pan.add(grip.point.clone().sub(under));
    return true;
  }

  /**
   * What's drawn at a point of the plot area on screen: the nearest mark there (ex. terrain), else
   * the plot's floor, else nothing (ex. the sky)
   */
  function surfaceAt(x: number, y: number) {
    if (!rayAt(x, y)) return null;
    const shown = (object: Object3D | null): boolean =>
      !object || (object.visible && shown(object.parent));
    const hit = zoomRaycaster
      .intersectObject(sceneState.root, true)
      .find(
        ({ object, point }) =>
          (object as Mesh).isMesh &&
          shown(object) &&
          (!sceneState.clip || clipPlanes.every((p) => p.distanceToPoint(point) >= 0))
      );
    if (hit) return hit.point;
    // The floor only where the plot is: past it, towards the horizon, it goes on without end
    const onFloor = zoomRaycaster.ray.intersectPlane(floor, new Vector3());
    return onFloor && Math.abs(onFloor.x) <= ctx.width / 2 && Math.abs(onFloor.z) <= ctx.height / 2
      ? onFloor
      : null;
  }

  /** The angles the camera was last placed at, to turn on from */
  let turnedFrom: { rotate: number; tilt: number } | null = null;
  /**
   * Zoomed in, what the view turns about: where it last zoomed towards, else what's nearest the
   * middle of the view as it starts turning, which stays where it is on screen as it turns.
   * Forgotten as the view pans, zooms or refits
   */
  let turningAbout: Vector3 | null = null;
  /** Where the view last zoomed towards, in the scene, until it pans or refits */
  let zoomedTo: Vector3 | null = null;

  /**
   * What's drawn nearest the middle of the view, from it on down (the middle, looking out towards
   * the horizon, may be sky)
   */
  function middleSurface() {
    for (const down of [0.5, 0.65, 0.8, 0.95]) {
      const point = surfaceAt(ctx.box.width / 2, ctx.box.height * down);
      if (point) return point;
    }
    return null;
  }

  /**
   * Zoomed in, turn about what it zoomed towards (or else what's in the middle of the view), as
   * orbit controls (and globes) turn about what they look at: wherever the zooms and pans that
   * brought it there went.  (Unzoomed, it turns about the middle of what's framed, as `place`
   * does.)  The camera is still where the view was turned `from`.
   */
  function turnAbout(to: { rotate: number; tilt: number }) {
    const from = turnedFrom;
    if (!from || (from.rotate === to.rotate && from.tilt === to.tilt)) return;
    if (!(camera instanceof PerspectiveCamera) || fitRadius || panZoomState().scale === 1) return;
    turningAbout ??= zoomedTo?.clone() ?? middleSurface();
    if (!turningAbout) return;
    // The camera, what it looks at, and what it's framed about, all turned about it, together
    const turn = orientation(to).multiply(orientation(from).invert());
    const pivot = fitCenter.clone().add(pan);
    pan.add(pivot.clone().sub(turningAbout).applyQuaternion(turn).add(turningAbout).sub(pivot));
  }

  /**
   * The point a zoom last went towards, and where it is on screen: zoomed towards, it stays there,
   * so the rest of a gesture (the wheel turning on, or the zoom buttons easing) doesn't look for it
   * again, which for detailed terrain takes a while.  Forgotten as the view turns, pans or refits
   */
  let zoomingAt: { x: number; y: number; point: Vector3 } | null = null;
  function zoomPoint(x: number, y: number) {
    if (!zoomingAt || Math.abs(zoomingAt.x - x) > 0.5 || Math.abs(zoomingAt.y - y) > 0.5) {
      const point = surfaceAt(x, y);
      zoomingAt = point ? { x, y, point } : null;
    }
    return zoomingAt?.point.clone() ?? null;
  }

  /**
   * Fold a new pan / zoom into `pan`: the change, along the camera's axes as it's turned now, so
   * an earlier pan stays where it was in the scene however the view has turned since.
   *
   * A perspective camera zooms towards what's under the pointer (or the middle, for the zoom
   * buttons): it, what it looks at, and what it turns about all move that share of the way to it,
   * so it stays under the pointer, zooming in flies on towards it, slowing as it nears, never
   * through it, and the view turns as it did before
   */
  function applyPanZoom() {
    turningAbout = null;
    const next = panZoomState();
    // A zoom (by `r`) keeps one point of the plot area where it is on screen, `t' = q - (q - t) r`:
    // where the pointer is, for the wheel
    const r = next.scale / applied.scale;
    const reset = next.scale === 1 && next.x === 0 && next.y === 0;
    const toward =
      !reset && camera instanceof PerspectiveCamera && !fitRadius && Math.abs(1 - r) > 1e-6
        ? zoomPoint((next.x - r * applied.x) / (1 - r), (next.y - r * applied.y) / (1 - r))
        : null;
    if (reset) {
      // Back where it started (ex. `reset()`)
      pan.set(0, 0, 0);
      zoomedTo = null;
      grip = null;
    } else if (toward) {
      grip = null;
      zoomedTo = toward.clone();
      pan.addScaledVector(toward.sub(fitCenter).sub(pan), 1 - 1 / r);
    } else if (dragGround(next)) {
      zoomingAt = null;
      zoomedTo = null;
    } else {
      zoomingAt = null;
      zoomedTo = null;
      // (What it looks at kept where the pan / zoom alone moves it, as the zoom draws it in)
      pan.add(lookingAt(applied.scale).sub(lookingAt(next.scale)));
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
    [ctx.width, ctx.height, ctx.box, ctx.zDepth, size.current, camera, shownFov];
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ctx.geo.projection;
    untrack(fit);
  });

  // Turning (ex. a drag) moves the camera round what it's framed on, or zoomed in, what it's
  // looking at
  $effect.pre(() => {
    const { rotate, tilt } = angles;
    viewDirection(rotate, tilt, direction);
    untrack(() => {
      zoomingAt = null;
      grip = null;
      if (sceneState.width && view) {
        turnAbout({ rotate, tilt });
        place();
      }
      turnedFrom = { rotate, tilt };
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

  // Where the floor is on screen about the plot's middle, so a `domain` transform pans and zooms
  // where the pointer is on it, as on an isometric floor (exact for `orthographic`, and near the
  // middle for `perspective`)
  $effect(() => {
    if (!ctx.view || ctx.transform.mode !== 'domain') return;
    const { width, height } = ctx;
    const step = Math.min(width, height) / 10;
    const middle = sceneState.project(width / 2, height / 2, 0);
    const across = sceneState.project(width / 2 + step, height / 2, 0);
    const down = sceneState.project(width / 2, height / 2 + step, 0);
    if (!middle || !across || !down || !(step > 0)) return;
    const a = (across.x - middle.x) / step;
    const b = (across.y - middle.y) / step;
    const c = (down.x - middle.x) / step;
    const d = (down.y - middle.y) / step;
    const { left, top } = ctx.padding;
    ctx._viewFloorMatrix = {
      a,
      b,
      c,
      d,
      e: middle.x - left - (a * width) / 2 - (c * height) / 2,
      f: middle.y - top - (b * width) / 2 - (d * height) / 2,
    };
    return () => {
      ctx._viewFloorMatrix = null;
    };
  });

  // A drag turns the view at the chart's usual rate again once the layer's gone
  $effect(() => () => {
    ctx._viewTurnRate = null;
  });

  // Tooltips: the row under the pointer, from whichever mark it hits first
  const raycaster = new Raycaster();
  // Lines (ex. `Spline`) are hit within a few pixels of them, as thin ones are hard to land on
  raycaster.params.Line2 = { threshold: 8 };
  const pointer = new Vector2();

  $effect(() => {
    const element = renderer.domElement;
    const onPointerMove = (e: PointerEvent) => {
      // Nothing here shows a tooltip, so leave it to the chart's (ex. a `quadtree` over the rows)
      if (!sceneState.pickables.size) return;
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
      // The nearest hit on what's drawn, not clipped away
      const hit = raycaster
        .intersectObjects(
          pickables.map((p) => p.object),
          false
        )
        .find(
          ({ point }) => !sceneState.clip || clipPlanes.every((p) => p.distanceToPoint(point) >= 0)
        );
      const datum = hit ? pickables.find((p) => p.object === hit.object)?.datum(hit) : undefined;
      if (datum != null) ctx.tooltip.show(e, datum);
      else ctx.tooltip.hide(e);
    };
    const onPointerLeave = (e: PointerEvent) => {
      if (sceneState.pickables.size) ctx.tooltip.hide(e);
    };
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerleave', onPointerLeave);
    return () => {
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', onPointerLeave);
    };
  });
</script>

{@render children?.()}
