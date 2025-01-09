export const DEFAULT_FILL = 'rgb(0, 0, 0)';

const CANVAS_STYLES_ELEMENT_ID = '__layerchart_canvas_styles_id';

type ComputedStylesOptions = {
  styles?: Partial<
    Omit<CSSStyleDeclaration, 'strokeWidth' | 'opacity'> & {
      strokeWidth?: number | string;
      opacity?: number | string;
    }
  >;
  classes?: string;
};

/**
 * Appends or reuses `<svg>` element below `<canvas>` to resolve CSS variables and classes (ex. `stroke: hsl(var(--color-primary))` => `stroke: rgb(...)` )
 */
function getComputedStyles(
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

    if (classes) {
      svg.setAttribute('class', classes);
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
  canvasCtx: CanvasRenderingContext2D,
  render: {
    stroke: (canvasCtx: CanvasRenderingContext2D) => void;
    fill: (canvasCtx: CanvasRenderingContext2D) => void;
  },
  styleOptions: ComputedStylesOptions = {}
) {
  // TODO: Consider memoizing?  How about reactiving to CSS variable changes (light/dark mode toggle)
  const computedStyles = getComputedStyles(canvasCtx.canvas, styleOptions);

  // Adhere to CSS paint order: https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order
  const paintOrder =
    computedStyles?.paintOrder === 'stroke' ? ['stroke', 'fill'] : ['fill', 'stroke'];

  if (computedStyles?.opacity) {
    canvasCtx.globalAlpha = Number(computedStyles?.opacity);
  }

  // Text properties
  canvasCtx.font = computedStyles.font;

  // TODO: Hack to handle `textAnchor` with canvas.  Try to find a better approach
  if (computedStyles.textAnchor === 'middle') {
    canvasCtx.textAlign = 'center';
  } else if (computedStyles.textAnchor === 'end') {
    canvasCtx.textAlign = 'right';
  } else {
    canvasCtx.textAlign = computedStyles.textAlign as CanvasTextAlign; // TODO: Handle `justify` and `match-parent`?
  }

  // TODO: Handle `textBaseline` / `verticalAnchor` (Text)
  // canvasCtx.textBaseline = 'top';
  // canvasCtx.textBaseline = 'middle';
  // canvasCtx.textBaseline = 'bottom';
  // canvasCtx.textBaseline = 'alphabetic';
  // canvasCtx.textBaseline = 'hanging';
  // canvasCtx.textBaseline = 'ideographic';

  paintOrder.forEach((attr) => {
    if (attr === 'fill') {
      const fill = computedStyles?.fill === DEFAULT_FILL ? null : computedStyles?.fill;
      if (fill) {
        canvasCtx.fillStyle = fill;
        render.fill(canvasCtx);
      }
    } else if (attr === 'stroke') {
      const stroke = computedStyles?.stroke === 'none' ? null : computedStyles?.stroke;
      if (stroke) {
        canvasCtx.lineWidth =
          typeof computedStyles?.strokeWidth === 'string'
            ? Number(computedStyles?.strokeWidth?.replace('px', ''))
            : (computedStyles?.strokeWidth ?? 1);

        canvasCtx.strokeStyle = stroke;
        render.stroke(canvasCtx);
      }
    }
  });
}

/** Render SVG path data onto canvas context.  Supports CSS variables and classes by tranferring to hidden `<svg>` element before retrieval) */
export function renderPathData(
  canvasCtx: CanvasRenderingContext2D,
  pathData: string | null | undefined,
  styleOptions: ComputedStylesOptions = {}
) {
  const path = new Path2D(pathData ?? '');

  render(
    canvasCtx,
    {
      fill: (ctx) => ctx.fill(path),
      stroke: (ctx) => ctx.stroke(path),
    },
    styleOptions
  );
}

export function renderText(
  canvasCtx: CanvasRenderingContext2D,
  text: string | number | null | undefined,
  coords: { x: number; y: number },
  styleOptions: ComputedStylesOptions = {}
) {
  if (text) {
    render(
      canvasCtx,
      {
        fill: (ctx) => ctx.fillText(text.toString(), coords.x, coords.y),
        stroke: (ctx) => ctx.strokeText(text.toString(), coords.x, coords.y),
      },
      styleOptions
    );
  }
}

/** Clear canvas accounting for Canvas `context.translate(...)` */
export function clearCanvasContext(
  canvasCtx: CanvasRenderingContext2D,
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
  canvasCtx.clearRect(
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
