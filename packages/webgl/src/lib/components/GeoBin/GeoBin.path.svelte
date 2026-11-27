<script lang="ts">
  import { getBinPaths, type BinPath } from './GeoBin.cells.js';

  // One of the `GeoBin`'s paths: kept for the `GeoBin` to draw with the rest in one mesh (each
  // its own `Path` would be thousands of meshes), so it draws nothing itself
  let {
    pathData,
    z,
    fill,
    fillOpacity = 1,
    stroke,
    strokeOpacity = 1,
    strokeWidth,
    opacity = 1,
    class: className,
    onclick,
    onpointerenter,
    onpointermove,
    onpointerleave,
  }: {
    pathData?: string;
    z?: number | [number, number];
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeOpacity?: number;
    strokeWidth?: number;
    opacity?: number;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    onpointerenter?: (e: PointerEvent) => void;
    onpointermove?: (e: PointerEvent) => void;
    onpointerleave?: (e: PointerEvent) => void;
  } = $props();

  const paths = getBinPaths();
  const path: BinPath = {
    get pathData() {
      return pathData;
    },
    get z() {
      return Array.isArray(z) ? z[1] : (z ?? 0);
    },
    get fill() {
      return fill;
    },
    get fillOpacity() {
      return fillOpacity;
    },
    get stroke() {
      return stroke;
    },
    get strokeOpacity() {
      return strokeOpacity;
    },
    get strokeWidth() {
      return strokeWidth;
    },
    get opacity() {
      return opacity;
    },
    get class() {
      return className;
    },
    get onclick() {
      return onclick;
    },
    get onpointerenter() {
      return onpointerenter;
    },
    get onpointermove() {
      return onpointermove;
    },
    get onpointerleave() {
      return onpointerleave;
    },
  };
  paths.list.push(path);
  paths.bump();
  $effect(() => () => {
    const i = paths.list.indexOf(path);
    if (i >= 0) paths.list.splice(i, 1);
    paths.bump();
  });
</script>
