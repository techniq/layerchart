<script lang="ts" module>
  export type {
    PatternProps,
    PatternPropsWithoutHTML,
  } from './Pattern.shared.svelte.js';
</script>

<script lang="ts">
  import { createId } from '$lib/utils/createId.js';
  import type { PatternProps } from './Pattern.shared.svelte.js';

  const uid = $props.id();

  let {
    id = createId('pattern-', uid),
    size = 4,
    width = size,
    height = size,
    lines: linesProp,
    circles: circlesProp,
    background,
    children,
  }: PatternProps = $props();

  function withOpacity(color: string, opacity: number) {
    return opacity === 1 ? color : `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
  }

  function createCSSPattern(): string {
    const layers: string[] = [];

    if (linesProp) {
      const lineDefs = Array.isArray(linesProp)
        ? linesProp
        : linesProp === true
          ? [{}]
          : [linesProp];
      for (const line of lineDefs) {
        const color = withOpacity(
          line.color ?? 'var(--color-surface-content, currentColor)',
          line.opacity ?? 1
        );
        const sw = line.width ?? 1;

        let rotate = Math.round(line.rotate ?? 0) % 360;
        if (rotate > 180) rotate = rotate - 360;
        else if (rotate > 90) rotate = rotate - 180;
        else if (rotate < -180) rotate = rotate + 360;
        else if (rotate < -90) rotate = rotate + 180;

        let angle: number;
        let period: number;
        if (rotate === 0) {
          angle = 0;
          period = height;
        } else if (rotate === 90) {
          angle = 90;
          period = width;
        } else if (rotate > 0) {
          angle = 45;
          period = (width * height) / Math.sqrt(width * width + height * height);
        } else {
          angle = 135;
          period = (width * height) / Math.sqrt(width * width + height * height);
        }

        layers.push(
          `repeating-linear-gradient(${angle}deg, ${color} 0 ${sw}px, transparent ${sw}px ${period}px)`
        );
      }
    }

    if (circlesProp) {
      const circleDefs = Array.isArray(circlesProp)
        ? circlesProp
        : circlesProp === true
          ? [{}]
          : [circlesProp];
      for (const circle of circleDefs) {
        const color = withOpacity(
          circle.color ?? 'var(--color-surface-content, currentColor)',
          circle.opacity ?? 1
        );
        const r = circle.radius ?? 1;

        if (circle.stagger) {
          layers.push(
            `radial-gradient(circle at 25% 25%, ${color} ${r}px, transparent ${r}px) 0 0 / ${size}px ${size}px`,
            `radial-gradient(circle at 75% 75%, ${color} ${r}px, transparent ${r}px) 0 0 / ${size}px ${size}px`
          );
        } else {
          layers.push(
            `radial-gradient(circle at center, ${color} ${r}px, transparent ${r}px) 0 0 / ${size}px ${size}px`
          );
        }
      }
    }

    const isImage = background != null && /gradient\(|url\(/i.test(background);
    if (isImage) layers.push(`${background} 0 0 / ${width}px ${height}px`);

    if (layers.length === 0) return background ?? 'transparent';
    return !isImage && background ? `${layers.join(', ')}, ${background}` : layers.join(', ');
  }
</script>

{@render children?.({ id, pattern: createCSSPattern() })}
