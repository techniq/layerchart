export const DEFAULT_FILL = 'rgb(0, 0, 0)';

/** Render SVG path data onto canvas context.  Supports CSS classes  tranferring to `<canvas>` element for retrieval) */
export function renderPathData(
  canvasCtx: CanvasRenderingContext2D,
  pathData: string | null | undefined,
  styles: Partial<CSSStyleDeclaration> = {}
) {
  const path = new Path2D(pathData ?? '');

  const fill = styles.fill === DEFAULT_FILL ? null : styles.fill;
  if (fill) {
    canvasCtx.fillStyle = fill;
    canvasCtx.fill(path);
  }

  const stroke = styles.stroke === 'none' ? null : styles.stroke;
  if (stroke) {
    canvasCtx.lineWidth =
      typeof styles.strokeWidth === 'string'
        ? Number(styles.strokeWidth?.replace('px', ''))
        : (styles.strokeWidth ?? 0);
    canvasCtx.strokeStyle = stroke;
    canvasCtx.stroke(path);
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
