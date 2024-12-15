const DEFAULT_FILL = 'rgb(0, 0, 0)';

/** Render SVG path data onto canvas context.  Supports CSS classes  tranferring to `<canvas>` element for retrieval) */
export function renderPathData(
  canvasCtx: CanvasRenderingContext2D,
  pathData: string | null | undefined,
  props: { fill?: string; stroke?: string; strokeWidth?: number; class?: string } = {}
) {
  // Get classes from nearest `<canvas>` element.  Useful if classes are moved up from underlying component (ex. GeoPath)
  const computedStyles: Partial<CSSStyleDeclaration> = window.getComputedStyle(canvasCtx.canvas);

  const path = new Path2D(pathData ?? '');

  const fill = props.fill ?? (computedStyles.fill !== DEFAULT_FILL ? computedStyles.fill : null);
  if (fill) {
    canvasCtx.fillStyle = fill;
    canvasCtx.fill(path);
  }

  const stroke =
    props.stroke ?? (computedStyles.stroke === 'none' ? null : (computedStyles.stroke ?? null));
  if (stroke) {
    canvasCtx.lineWidth =
      props.strokeWidth ?? Number(computedStyles.strokeWidth?.replace('px', ''));
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
