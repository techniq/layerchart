<!-- The shapes a `Spline`'s lines close around, filled as an SVG path fills an open line -->
<script lang="ts">
  import { ShapeGeometry, ShapePath } from 'three';
  import { createMerged } from '../../utils/merged.svelte.js';

  let {
    lines,
    fill,
    opacity,
  }: {
    /** Each line's points, in the scene's axes (across, height, down the plot) */
    lines: { positions: number[]; data: any[] }[];
    /** A CSS color */
    fill: string;
    opacity: number;
  } = $props();

  createMerged({
    items: () =>
      lines.flatMap(({ positions, data }) => {
        if (positions.length < 9) return [];
        const shape = new ShapePath();
        shape.moveTo(positions[0], positions[2]);
        for (let i = 3; i < positions.length; i += 3) shape.lineTo(positions[i], positions[i + 2]);
        // In the scene's axes, at the line's first height, a little under the line
        const geometry = new ShapeGeometry(shape.toShapes())
          .rotateX(Math.PI / 2)
          .translate(0, positions[1] - 0.2, 0);
        return [{ d: data[0], geometry, fill, lines: [], stroke: null }];
      }),
    opacity: () => opacity,
    strokeWidth: () => 0,
    once: true,
  });
</script>
