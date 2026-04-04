import type { ClassValue } from 'svelte/elements';
import memoize from 'memoize';
import { cls } from '@layerstack/tailwind';
import type { PatternShape } from '$lib/components/Pattern.svelte';

/** @deprecated - use `isTransparentFill` instead */
export const DEFAULT_FILL = 'rgb(0, 0, 0)';

/**
 * Returns true if the fill color is effectively invisible (none, transparent, or alpha=0).
 * Used to skip canvas fill rendering for invisible fills.
 */
function isTransparentFill(fill: string): boolean {
  if (!fill || fill === 'none' || fill === 'transparent') return true;
  // Match rgba(..., 0) - alpha channel is 0 (fully transparent)
  return /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/.test(fill);
}

const CANVAS_STYLES_ELEMENT_ID = '__layerchart_canvas_styles_id';

/**
 * Parse an inline CSS style string into a StyleOptions object.
 * Converts kebab-case properties to camelCase (e.g., 'stroke-dasharray' -> 'strokeDasharray')
 */
function parseStyleString(styleString: string | null | undefined): StyleOptions {
  if (!styleString) return {};

  const styles: Record<string, string> = {};

  // Split by semicolons and process each declaration
  const declarations = styleString.split(';').filter((s) => s.trim());

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;

    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();

    if (!property || !value) continue;

    // Convert kebab-case to camelCase (e.g., 'stroke-dasharray' -> 'strokeDasharray')
    const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    styles[camelProperty] = value;
  }

  return styles as StyleOptions;
}

type StyleOptions = Partial<
  Omit<CSSStyleDeclaration, 'fillOpacity' | 'strokeOpacity' | 'strokeWidth' | 'opacity'> & {
    fillOpacity?: number | string;
    strokeOpacity?: number | string;
    strokeWidth?: number | string;
    opacity?: number | string;
  }
>;

export type ComputedStylesOptions = {
  styles?: StyleOptions;
  classes?: ClassValue | null;
  /** Inline style string (e.g., 'stroke-dasharray: 6 4') - will be parsed and merged with styles */
  style?: string | null;
};

const supportedStyles = [
  'fill',
  'fillOpacity',
  'stroke',
  'strokeOpacity',
  'strokeWidth',
  'strokeDasharray',
  'opacity',
  'fontWeight',
  'fontSize',
  'fontFamily',
  'textAnchor',
  'textAlign',
  'paintOrder',
] as const;

/**
 * Appends or reuses `<svg>` element below `<canvas>` to resolve CSS variables and classes (ex. `stroke: var(--color-primary)` => `stroke: rgb(...)` )
 */
export function _getComputedStyles(
  canvas: HTMLCanvasElement,
  { styles, classes }: ComputedStylesOptions = {}
) {
  // console.count(`getComputedStyles: ${getComputedStylesKey(canvas, { styles, classes })}`);
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

    // Capture copy to enable memoization and avoid capturing all styles (which is very slow)
    const computedStyles = supportedStyles.reduce((acc, style) => {
      acc[style] = window.getComputedStyle(svg)[style];
      return acc;
    }, {} as CSSStyleDeclaration);

    return computedStyles;
  } catch (e) {
    console.error('Unable to get computed styles', e);
    return {} as CSSStyleDeclaration;
  }
}

function getComputedStylesKey(
  canvas: HTMLCanvasElement,
  { styles, classes }: ComputedStylesOptions = {}
) {
  return JSON.stringify({ canvasId: canvas.id, styles, classes });
}

export const getComputedStyles = memoize(_getComputedStyles, {
  cacheKey: ([canvas, styleOptions]) => {
    return getComputedStylesKey(canvas, styleOptions);
  },
});

/** Render onto canvas context.  Supports CSS variables and classes by tranferring to hidden `<svg>` element before retrieval) */
function render(
  ctx: CanvasRenderingContext2D,
  render: {
    stroke: (ctx: CanvasRenderingContext2D) => void;
    fill: (ctx: CanvasRenderingContext2D) => void;
  },
  styleOptions: ComputedStylesOptions = {},
  {
    applyText,
  }: {
    applyText?: boolean;
  } = {}
) {
  // console.count('render');

  // Parse inline style string and merge with styles object
  const parsedInlineStyles = parseStyleString(styleOptions.style);
  const mergedStyles = { ...styleOptions.styles, ...parsedInlineStyles };

  // TODO: Consider memoizing?  How about reactiving to CSS variable changes (light/dark mode toggle)
  let resolvedStyles: StyleOptions;
  if (
    typeof document === 'undefined' ||
    (styleOptions.classes == null &&
      !Object.values(mergedStyles).some((v) => typeof v === 'string' && v.includes('var(')))
  ) {
    // Skip resolving styles if running on server (no DOM), or no classes are provided and no styles are using CSS variables
    resolvedStyles = mergedStyles;
  } else {
    // Remove constant non-css variable properties (ex. `strokeWidth: 0.5`, `fill: #123456`) as not needed and improves memoization cache hit
    const { constantStyles, variableStyles } = Object.entries(mergedStyles).reduce<{
      constantStyles: StyleOptions;
      variableStyles: StyleOptions;
    }>(
      (acc, [key, value]) => {
        if (typeof value === 'number' || (typeof value === 'string' && !value.includes('var('))) {
          (acc.constantStyles as any)[key] = value;
        } else if (typeof value === 'string' && value.includes('var(')) {
          (acc.variableStyles as any)[key] = value;
        }
        return acc;
      },
      { constantStyles: {} as StyleOptions, variableStyles: {} as StyleOptions }
    );

    const computedStyles = getComputedStyles(ctx.canvas, {
      styles: variableStyles,
      classes: styleOptions.classes,
    });
    resolvedStyles = { ...computedStyles, ...constantStyles };
  }

  // Adhere to CSS paint order: https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order
  const paintOrder =
    resolvedStyles?.paintOrder === 'stroke' ? ['stroke', 'fill'] : ['fill', 'stroke'];

  if (resolvedStyles?.opacity) {
    ctx.globalAlpha = Number(resolvedStyles?.opacity);
  }

  // font/text properties can be expensive to set (not sure why), so only apply if needed (renderText())
  if (applyText) {
    // Text properties
    ctx.font = `${resolvedStyles.fontWeight} ${resolvedStyles.fontSize} ${resolvedStyles.fontFamily}`; // build string instead of using `computedStyles.font` to fix/workaround `tabular-nums` returning `null`

    if (resolvedStyles.textAnchor === 'middle') {
      ctx.textAlign = 'center';
    } else if (resolvedStyles.textAnchor === 'end') {
      ctx.textAlign = 'right';
    } else if (resolvedStyles.textAnchor === 'start') {
      ctx.textAlign = 'left';
    } else if (resolvedStyles.textAlign) {
      ctx.textAlign = resolvedStyles.textAlign as CanvasTextAlign;
    }
    // If textAnchor/textAlign are unset, ctx.textAlign retains its pre-set value (e.g. from Text.svelte)

    // TODO: Handle `textBaseline` / `verticalAnchor` (Text)
    // ctx.textBaseline = 'top';
    // ctx.textBaseline = 'middle';
    // ctx.textBaseline = 'bottom';
    // ctx.textBaseline = 'alphabetic';
    // ctx.textBaseline = 'hanging';
    // ctx.textBaseline = 'ideographic';
  }

  // Dashed lines (supports both comma and space separators, e.g., "2,2" or "2 2")
  if (resolvedStyles.strokeDasharray && resolvedStyles.strokeDasharray !== 'none') {
    const dashArray = resolvedStyles.strokeDasharray
      .split(/[\s,]+/)
      .filter((s) => s.length > 0)
      .map((s) => Number(s.replace('px', '')));
    if (dashArray.length > 0 && dashArray.every((n) => !isNaN(n))) {
      ctx.setLineDash(dashArray);
    }
  }

  for (const attr of paintOrder) {
    if (attr === 'fill') {
      const fill =
        styleOptions.styles?.fill &&
        ((typeof CanvasGradient !== 'undefined' && (styleOptions.styles?.fill as any) instanceof CanvasGradient) ||
          (typeof CanvasPattern !== 'undefined' && (styleOptions.styles?.fill as any) instanceof CanvasPattern) ||
          !styleOptions.styles?.fill?.includes('var'))
          ? styleOptions.styles.fill
          : resolvedStyles?.fill;

      if (fill && !isTransparentFill(fill)) {
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
        ((typeof CanvasGradient !== 'undefined' && (styleOptions.styles?.stroke as any) instanceof CanvasGradient) ||
          !styleOptions.styles?.stroke?.includes('var'))
          ? styleOptions.styles?.stroke
          : resolvedStyles?.stroke;

      if (stroke && !['none'].includes(stroke)) {
        const currentGlobalAlpha = ctx.globalAlpha;

        const strokeOpacity = Number(resolvedStyles?.strokeOpacity);
        const opacity = Number(resolvedStyles?.opacity);
        if (!isNaN(strokeOpacity) && strokeOpacity !== 1) {
          ctx.globalAlpha = strokeOpacity * (isNaN(opacity) ? 1 : opacity);
        }

        ctx.lineWidth =
          typeof resolvedStyles?.strokeWidth === 'string'
            ? Number(resolvedStyles?.strokeWidth?.replace('px', ''))
            : (resolvedStyles?.strokeWidth ?? 1);

        ctx.strokeStyle = stroke;
        render.stroke(ctx);

        // Restore in case it was modified by `strokeOpacity`
        ctx.globalAlpha = currentGlobalAlpha;
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
      styleOptions,
      { applyText: true }
    );
  }
}

export function renderRect(
  ctx: CanvasRenderingContext2D,
  coords: { x: number; y: number; width: number; height: number; rx?: number; ry?: number },
  styleOptions: ComputedStylesOptions = {}
) {
  const { x, y, width, height } = coords;
  const rx = coords.rx ?? 0;
  const ry = coords.ry ?? rx; // Default ry to rx if not provided (SVG behavior)

  // No rounding - use simple rect methods
  if (rx === 0 && ry === 0) {
    render(
      ctx,
      {
        fill: (ctx) => ctx.fillRect(x, y, width, height),
        stroke: (ctx) => ctx.strokeRect(x, y, width, height),
      },
      styleOptions
    );
    return;
  }

  // Try native roundRect if available (modern browsers)
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, [rx, ry]);
    render(
      ctx,
      {
        fill: (ctx) => ctx.fill(),
        stroke: (ctx) => ctx.stroke(),
      },
      styleOptions
    );
    ctx.closePath();
    return;
  }

  // Fallback: use path rendering for rounded corners
  // Clamp radii to half the width/height
  const clampedRx = Math.min(rx, width / 2);
  const clampedRy = Math.min(ry, height / 2);

  // Build rounded rect path: start at top-left (after corner), go clockwise
  const pathData = [
    `M${x + clampedRx},${y}`, // Move to top-left (after corner)
    `h${width - 2 * clampedRx}`, // Top edge
    `a${clampedRx},${clampedRy} 0 0 1 ${clampedRx},${clampedRy}`, // Top-right corner
    `v${height - 2 * clampedRy}`, // Right edge
    `a${clampedRx},${clampedRy} 0 0 1 ${-clampedRx},${clampedRy}`, // Bottom-right corner
    `h${2 * clampedRx - width}`, // Bottom edge
    `a${clampedRx},${clampedRy} 0 0 1 ${-clampedRx},${-clampedRy}`, // Bottom-left corner
    `v${2 * clampedRy - height}`, // Left edge
    `a${clampedRx},${clampedRy} 0 0 1 ${clampedRx},${-clampedRy}`, // Top-left corner
    'z', // Close path
  ].join(' ');

  renderPathData(ctx, pathData, styleOptions);
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
  const devicePixelRatio = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

  ctx.canvas.width = width * devicePixelRatio;
  ctx.canvas.height = height * devicePixelRatio;

  ctx.canvas.style.width = `${width}px`;
  ctx.canvas.style.height = `${height}px`;

  ctx.scale(devicePixelRatio, devicePixelRatio);
  return { width: ctx.canvas.width, height: ctx.canvas.height };
}

/** Get pixel color (r,g,b,a) at canvas coordinates */
export function getPixelColor(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : null) ?? 1;
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
