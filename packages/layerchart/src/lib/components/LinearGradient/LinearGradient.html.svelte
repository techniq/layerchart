<script lang="ts" module>
  export type {
    LinearGradientProps,
    LinearGradientPropsWithoutHTML,
  } from './LinearGradient.shared.svelte.js';
</script>

<script lang="ts">
  import { createId } from '$lib/utils/createId.js';
  import type { LinearGradientProps } from './LinearGradient.shared.svelte.js';

  const uid = $props.id();

  let {
    id = createId('linearGradient-', uid),
    stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
    vertical = false,
    rotate,
    children,
  }: LinearGradientProps = $props();

  function createCSSGradient(): string {
    if (!stops?.length) return '';

    let direction: string;
    if (rotate !== undefined) {
      // Convert SVG rotation to CSS linear-gradient angle
      // SVG: rotate(0) on horizontal gradient = left-to-right = CSS 90deg
      // SVG: rotate(0) on vertical gradient = top-to-bottom = CSS 180deg
      const baseAngle = vertical ? 180 : 90;
      const cssAngle = baseAngle + rotate;
      direction = `${cssAngle}deg`;
    } else {
      direction = vertical ? 'to bottom' : 'to right';
    }

    const cssStops = stops
      .map((stop, i) => {
        if (Array.isArray(stop)) {
          return `${stop[1]} ${stop[0]}`;
        } else {
          return `${stop} ${i * (100 / (stops.length - 1))}%`;
        }
      })
      .join(', ');

    return `linear-gradient(${direction}, ${cssStops})`;
  }
</script>

{@render children?.({ id, gradient: createCSSGradient() })}
