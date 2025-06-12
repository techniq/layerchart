import type { ClassValue } from 'svelte/elements';
import memoize from 'memoize';
import { cls } from '@layerstack/tailwind';
import type { PatternShape } from '$lib/components/Pattern.svelte';

export const DEFAULT_FILL = 'rgb(0, 0, 0)';

const CANVAS_STYLES_ELEMENT_ID = '__layerchart_canvas_styles_id';

type StyleOptions = Partial<
  Omit<CSSStyleDeclaration, 'fillOpacity' | 'strokeWidth' | 'opacity'> & {
    fillOpacity?: number | string;
    strokeWidth?: number | string;
    opacity?: number | string;
  }
>;

export type ComputedStylesOptions = {
  styles?: StyleOptions;
  classes?: ClassValue | null;
};

/**
 * Appends or reuses `<svg>` element below `<canvas>` to resolve CSS variables and classes (ex. `stroke: var(--color-primary)` => `stroke: rgb(...)` )
 */
export function getComputedStyles(
  canvas: HTMLCanvasElement,
  { styles, classes }: ComputedStylesOptions = {}
) {
  try {
    // Get or create `<svg>` below `<canvas>`
    let svg = document.getElementById(CANVAS_STYLES_ELEMENT_ID) as SVGElement | null;

    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', CANVAS_STYLES_ELEMENT_ID);
      svg.style.display = 'none';
      // Add `<svg>` next to `<canvas>` to allow same scope resolution for CSS variables
      canvas.after(svg);
    }
    svg = svg!; // guarantee SVG is set

    // Remove any previously set styles or classes.  Not able to do as part of cleanup below as `window.getComputedStyles()` appearing to be lazily read and removing `style` results in incorrect values, and copying result is very slow
    svg.removeAttribute('style');
    svg.removeAttribute('class');

    // Add styles and class to svg element
    if (styles) {
      Object.assign(svg.style, styles);
    }
    // Make sure `<svg>` is not visible
    svg.style.display = 'none';

    if (classes) {
      svg.setAttribute(
        'class',
        cls(classes)
          .split(' ')
          .filter((s) => !s.startsWith('transition-'))
          .join(' ')
      );
    }

    const computedStyles = window.getComputedStyle(svg);
    return computedStyles;
  } catch (e) {
    console.error('Unable to get computed styles', e);
    return {} as CSSStyleDeclaration;
  }
}

/** Render onto canvas context.  Supports CSS variables and classes by tranferring to hidden `<svg>` element before retrieval) */
function render(
  ctx: CanvasRenderingContext2D,
  render: {
    stroke: (ctx: CanvasRenderingContext2D) => void;
    fill: (ctx: CanvasRenderingContext2D) => void;
  },
  styleOptions: ComputedStylesOptions = {}
) {
  // console.count('render');

  // TODO: Consider memoizing?  How about reactiving to CSS variable changes (light/dark mode toggle)
  let resolvedStyles: StyleOptions;
  if (
    styleOptions.classes == null &&
    !Object.values(styleOptions.styles ?? {}).some(
      (v) => typeof v === 'string' && v.includes('var(')
    )
  ) {
    // Skip resolving styles if no classes are provided and no styles are using CSS variables
    // TODO: Convert colors using `rgb(0 0 0 / 50%)` to `rgba(0, 0, 0, 0.5)`
    resolvedStyles = styleOptions.styles ?? {};
  } else {
    const computedStyles = getComputedStyles(ctx.canvas, styleOptions);
    resolvedStyles = computedStyles;
  }

  // Adhere to CSS paint order: https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order
  const paintOrder =
    resolvedStyles?.paintOrder === 'stroke' ? ['stroke', 'fill'] : ['fill', 'stroke'];

  if (resolvedStyles?.opacity) {
    ctx.globalAlpha = Number(resolvedStyles?.opacity);
  }

  // Text properties
  ctx.font = `${resolvedStyles.fontWeight} ${resolvedStyles.fontSize} ${resolvedStyles.fontFamily}`; // build string instead of using `computedStyles.font` to fix/workaround `tabular-nums` returning `null`

  // TODO: Hack to handle `textAnchor` with canvas.  Try to find a better approach
  if (resolvedStyles.textAnchor === 'middle') {
    ctx.textAlign = 'center';
  } else if (resolvedStyles.textAnchor === 'end') {
    ctx.textAlign = 'right';
  } else {
    ctx.textAlign = resolvedStyles.textAlign as CanvasTextAlign; // TODO: Handle/map `justify` and `match-parent`?
  }

  // TODO: Handle `textBaseline` / `verticalAnchor` (Text)
  // ctx.textBaseline = 'top';
  // ctx.textBaseline = 'middle';
  // ctx.textBaseline = 'bottom';
  // ctx.textBaseline = 'alphabetic';
  // ctx.textBaseline = 'hanging';
  // ctx.textBaseline = 'ideographic';

  // Dashed lines
  if (resolvedStyles.strokeDasharray?.includes(',')) {
    const dashArray = resolvedStyles.strokeDasharray
      .split(',')
      .map((s) => Number(s.replace('px', '')));
    ctx.setLineDash(dashArray);
  }

  for (const attr of paintOrder) {
    if (attr === 'fill') {
      const fill =
        styleOptions.styles?.fill &&
        ((styleOptions.styles?.fill as any) instanceof CanvasGradient ||
          (styleOptions.styles?.fill as any) instanceof CanvasPattern ||
          !styleOptions.styles?.fill?.includes('var'))
          ? styleOptions.styles.fill
          : resolvedStyles?.fill;

      if (fill && !['none', DEFAULT_FILL].includes(fill)) {
        const currentGlobalAlpha = ctx.globalAlpha;

        const fillOpacity = Number(resolvedStyles?.fillOpacity);
        const opacity = Number(resolvedStyles?.opacity);
        ctx.globalAlpha = fillOpacity * opacity;

        ctx.fillStyle = fill;
        render.fill(ctx);

        // Restore in case it was modified by `fillOpacity`
        ctx.globalAlpha = currentGlobalAlpha;
      }
    } else if (attr === 'stroke') {
      const stroke =
        styleOptions.styles?.stroke &&
        ((styleOptions.styles?.stroke as any) instanceof CanvasGradient ||
          !styleOptions.styles?.stroke?.includes('var'))
          ? styleOptions.styles?.stroke
          : resolvedStyles?.stroke;

      if (stroke && !['none'].includes(stroke)) {
        ctx.lineWidth =
          typeof resolvedStyles?.strokeWidth === 'string'
            ? Number(resolvedStyles?.strokeWidth?.replace('px', ''))
            : (resolvedStyles?.strokeWidth ?? 1);

        ctx.strokeStyle = stroke;
        render.stroke(ctx);
      }
    }
  }
}

/** Render SVG path data onto canvas context.  Supports CSS variables and classes by tranferring to hidden `<svg>` element before retrieval) */
export function renderPathData(
  ctx: CanvasRenderingContext2D,
  pathData: string | null | undefined,
  styleOptions: ComputedStylesOptions = {}
) {
  const path = new Path2D(pathData ?? '');

  render(
    ctx,
    {
      fill: (ctx) => ctx.fill(path),
      stroke: (ctx) => ctx.stroke(path),
    },
    styleOptions
  );
}

export function renderText(
  ctx: CanvasRenderingContext2D,
  text: string | number | null | undefined,
  coords: { x: number; y: number },
  styleOptions: ComputedStylesOptions = {}
) {
  if (text) {
    render(
      ctx,
      {
        fill: (ctx) => ctx.fillText(text.toString(), coords.x, coords.y),
        stroke: (ctx) => ctx.strokeText(text.toString(), coords.x, coords.y),
      },
      styleOptions
    );
  }
}

export function renderRect(
  ctx: CanvasRenderingContext2D,
  coords: { x: number; y: number; width: number; height: number },
  styleOptions: ComputedStylesOptions = {}
) {
  render(
    ctx,
    {
      fill: (ctx) => ctx.fillRect(coords.x, coords.y, coords.width, coords.height),
      stroke: (ctx) => ctx.strokeRect(coords.x, coords.y, coords.width, coords.height),
    },
    styleOptions
  );
}

export function renderCircle(
  ctx: CanvasRenderingContext2D,
  coords: { cx: number; cy: number; r: number },
  styleOptions: ComputedStylesOptions = {}
) {
  ctx.beginPath();
  ctx.arc(coords.cx, coords.cy, coords.r, 0, 2 * Math.PI);
  render(
    ctx,
    {
      fill: (ctx) => {
        ctx.fill();
      },
      stroke: (ctx) => {
        ctx.stroke();
      },
    },
    styleOptions
  );
  ctx.closePath();
}

export function renderEllipse(
  ctx: CanvasRenderingContext2D,
  coords: { cx: number; cy: number; rx: number; ry: number },
  styleOptions: ComputedStylesOptions = {}
) {
  ctx.beginPath();
  ctx.ellipse(coords.cx, coords.cy, coords.rx, coords.ry, 0, 0, 2 * Math.PI);
  render(
    ctx,
    {
      fill: (ctx) => {
        ctx.fill();
      },
      stroke: (ctx) => {
        ctx.stroke();
      },
    },
    styleOptions
  );
  ctx.closePath();
}

/** Clear canvas accounting for Canvas `context.translate(...)` */
export function clearCanvasContext(
  ctx: CanvasRenderingContext2D,
  options: {
    containerWidth: number;
    containerHeight: number;
    padding: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  }
) {
  // Clear with negative offset due to Canvas `context.translate(...)`
  ctx.clearRect(
    -options.padding.left,
    -options.padding.top,
    options.containerWidth,
    options.containerHeight
  );
}

/**
	Scales a canvas for high DPI / retina displays.
  @see: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#examples
  @see: https://web.dev/articles/canvas-hidipi
*/
export function scaleCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const devicePixelRatio = window.devicePixelRatio || 1;

  ctx.canvas.width = width * devicePixelRatio;
  ctx.canvas.height = height * devicePixelRatio;

  ctx.canvas.style.width = `${width}px`;
  ctx.canvas.style.height = `${height}px`;

  ctx.scale(devicePixelRatio, devicePixelRatio);
  return { width: ctx.canvas.width, height: ctx.canvas.height };
}

/** Get pixel color (r,g,b,a) at canvas coordinates */
export function getPixelColor(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const dpr = window.devicePixelRatio ?? 1;
  const imageData = ctx.getImageData(x * dpr, y * dpr, 1, 1);
  const [r, g, b, a] = imageData.data;
  return { r, g, b, a };
}

export function _createLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: { offset: number; color: string }[]
) {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

  for (const { offset, color } of stops) {
    gradient.addColorStop(offset, color);
  }

  return gradient;
}

/** Create linear gradient and memoize result to fix reactivity */
export const createLinearGradient = memoize(_createLinearGradient, {
  cacheKey: (args) => JSON.stringify(args.slice(1)), // Ignore `ctx` argument
});

export function _createPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  shapes: PatternShape[],
  background?: string
) {
  const patternCanvas = document.createElement('canvas');
  const patternCtx = patternCanvas.getContext('2d')!;

  // Add pattern canvas to DOM to allow computed styles to be read (`getComputedStyles()`)
  ctx.canvas.after(patternCanvas);

  // TODO: Fix blurry pattern
  // const newScale = scaleCanvas(patternCtx, width, height);
  patternCanvas.width = width;
  patternCanvas.height = height;

  if (background) {
    patternCtx.fillStyle = background;
    patternCtx.fillRect(0, 0, width, height);
  }

  for (const shape of shapes) {
    patternCtx.save();
    if (shape.type === 'circle') {
      renderCircle(
        patternCtx,
        { cx: shape.cx, cy: shape.cy, r: shape.r },
        { styles: { fill: shape.fill, opacity: shape.opacity } }
      );
    } else if (shape.type === 'line') {
      renderPathData(patternCtx, shape.path, {
        styles: { stroke: shape.stroke, strokeWidth: shape.strokeWidth, opacity: shape.opacity },
      });
    }
    patternCtx.restore();
  }

  const pattern = ctx.createPattern(patternCanvas, 'repeat');

  // Cleanup
  ctx.canvas.parentElement?.removeChild(patternCanvas);

  return pattern;
}

/** Create pattern and memoize result to fix reactivity */
export const createPattern = memoize(_createPattern, {
  cacheKey: (args) => JSON.stringify(args.slice(1)), // Ignore `ctx` argument
});
