import memoize from 'memoize';

const MEASUREMENT_ELEMENT_ID = '__text_measurement_id';

function _getStringWidth(str: string, style?: CSSStyleDeclaration) {
  try {
    // Calculate length of each word to be used to determine number of words per line
    let textEl = document.getElementById(
      MEASUREMENT_ELEMENT_ID
    ) as unknown as SVGTextElement | null;
    if (!textEl) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.width = '0';
      svg.style.height = '0';
      svg.style.position = 'absolute';
      svg.style.top = '-100%';
      svg.style.left = '-100%';
      textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.setAttribute('id', MEASUREMENT_ELEMENT_ID);
      svg.appendChild(textEl);
      document.body.appendChild(svg);
    }

    Object.assign(textEl.style, style);
    textEl.textContent = str;
    return textEl.getComputedTextLength();
  } catch (e) {
    return null;
  }
}

export const getStringWidth = memoize(_getStringWidth, {
  cacheKey: ([str, style]) => `${str}_${JSON.stringify(style)}`,
});

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Axis-aligned box enclosing `rect` after rotating it `degrees` about (`originX`, `originY`) —
 * the same rotation SVG's `rotate(deg, x, y)` applies.
 *
 * A rotated label still has to be compared as an axis-aligned box (that is all `occlude()` tests),
 * so it is widened to the box that contains it.  At 45° a long label takes far less horizontal
 * room than it does flat, and measuring it unrotated would drop neighbours that actually fit.
 */
function rotateRect(rect: Rect, degrees: number, originX: number, originY: number): Rect {
  if (!degrees) return rect;

  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const corners = [
    [rect.x, rect.y],
    [rect.x + rect.width, rect.y],
    [rect.x, rect.y + rect.height],
    [rect.x + rect.width, rect.y + rect.height],
  ].map(([cx, cy]) => {
    const dx = cx - originX;
    const dy = cy - originY;
    return [originX + dx * cos - dy * sin, originY + dx * sin + dy * cos];
  });

  const xs = corners.map(([cx]) => cx);
  const ys = corners.map(([, cy]) => cy);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
}

export type TextRectOptions = {
  /** Horizontal placement of `x` within the text. @default 'start' */
  textAnchor?: 'start' | 'middle' | 'end';
  /** Vertical placement of `y` within the text. @default 'middle' */
  verticalAnchor?: 'start' | 'middle' | 'end';
  /** Font size (px) — measures the width and sets the height. @default 16 */
  fontSize?: number;
  /** Height of each line when `text` is multiline. @default `fontSize` */
  lineHeight?: number;
  /** Additional offset applied to `x` / `y` (matching `<Text>`'s `dx` / `dy`). */
  dx?: number;
  dy?: number;
  /**
   * Degrees to rotate the text by, matching `<Text>`'s `rotate`.
   *
   * The result stays axis-aligned — it is the box *enclosing* the rotated text, which is what
   * `occlude()` needs.  Rotation is about (`x`, `y`) and deliberately ignores `dx`/`dy`, because
   * `<Text>` emits `rotate(deg, x, y)` and so pivots about the unoffset anchor.
   */
  rotate?: number;
};

/**
 * Bounding box (`{ x, y, width, height }`) of `text` anchored at (`x`, `y`) — matching
 * how `<Text>` positions it for the given `textAnchor`/`verticalAnchor`/`rotate`. Width is
 * measured with the same memoized metrics as `<Text>` (falling back to a character-count estimate
 * when the DOM is unavailable, e.g. during SSR), making it a convenient `bounds` for
 * `occlude()`.
 *
 * Pass an array to measure a multiline `<Text>` value: the box is as wide as the widest line and
 * as tall as the stack.
 */
export function getTextRect(
  text: string | string[],
  x: number,
  y: number,
  options: TextRectOptions = {}
) {
  const {
    textAnchor = 'start',
    verticalAnchor = 'middle',
    fontSize = 16,
    lineHeight = fontSize,
    dx = 0,
    dy = 0,
    rotate = 0,
  } = options;

  const lines = Array.isArray(text) ? text : [text];
  const width = lines.reduce((widest, line) => {
    const lineWidth =
      getStringWidth(line, { fontSize: `${fontSize}px` } as CSSStyleDeclaration) ??
      line.length * fontSize * 0.6;
    return Math.max(widest, lineWidth);
  }, 0);
  const height = lines.length > 1 ? lineHeight * lines.length : fontSize;

  const ax = x + dx;
  const ay = y + dy;
  const rect = {
    x: textAnchor === 'end' ? ax - width : textAnchor === 'middle' ? ax - width / 2 : ax,
    y: verticalAnchor === 'end' ? ay - height : verticalAnchor === 'middle' ? ay - height / 2 : ay,
    width,
    height,
  };

  return rotateRect(rect, rotate, x, y);
}

export type RasterizeTextOptions = {
  fontSize?: string;
  fontWeight?: number;
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  spacing?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
};

export function rasterizeText(text: string, options: RasterizeTextOptions = {}) {
  const fontSize = options.fontSize ?? '200px';
  const fontWeight = options.fontWeight ?? 600;
  const fontFamily = options.fontFamily ?? 'sans-serif';
  const textAlign = options.textAlign ?? 'center';
  const textBaseline = options.textBaseline ?? 'middle';
  const spacing = options.spacing ?? 20;
  const width = options.width ?? 960;
  const height = options.height ?? 500;
  const x = options.x ?? width / 2;
  const y = options.y ?? height / 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d')!;
  context.font = [fontWeight, fontSize, fontFamily].join(' ');
  context.textAlign = textAlign;
  context.textBaseline = textBaseline;

  const dx = context.measureText(text).width;
  const dy = +fontSize.replace('px', '');
  const bBox = [
    [x - dx / 2, y - dy / 2],
    [x + dx / 2, y + dy / 2],
  ];

  context.fillText(text, x, y);

  var imageData = context.getImageData(0, 0, width, height);

  var pixels = [];
  for (let x = bBox[0][0]; x < bBox[1][0]; x += spacing) {
    for (let y = bBox[0][1]; y < bBox[1][1]; y += spacing) {
      const pixel = getPixel(imageData, x, y);
      if (pixel[3] != 0) pixels.push([x, y]);
    }
  }

  return pixels;
}

function getPixel(imageData: ImageData, x: number, y: number) {
  var i = 4 * (Math.floor(x) + Math.floor(y) * imageData.width);
  var d = imageData.data;
  return [d[i], d[i + 1], d[i + 2], d[i + 3]];
}

export function toTitleCase(str: string) {
  return str.replace(/^\w/, (d) => d.toUpperCase());
}

const DEFAULT_ELLIPSIS = '…';

export type TruncateTextOptions = {
  /**
   * The maximum pixel width (optional if maxChars is provided).
   */
  maxWidth?: number;

  /**
   * CSS style for width calculation
   */
  style?: CSSStyleDeclaration;

  /**
   * The maximum character count
   */
  maxChars?: number;

  /**
   * Where to place the ellipsis: 'start', 'middle', or 'end'
   *
   * @default 'end'
   */
  position?: 'start' | 'middle' | 'end';

  /**
   * The character(s) to use as the ellipsis
   *
   * @default '…'
   */
  ellipsis?: string;
};

/**
 * Truncates a string to fit within a specified pixel width or character count.
 * If the string's width exceeds the maxWidth, it will be truncated. If the character
 * count exceeds maxChars, it will also be truncated.
 *
 * The ellipsis can be placed at the start, middle, or end of the string.
 */
export function truncateText(
  text: string,
  { position = 'end', ellipsis = DEFAULT_ELLIPSIS, maxWidth, style, maxChars }: TruncateTextOptions
): string {
  if (!text) return '';

  // no constraints, return original text
  if (maxWidth === undefined && maxChars === undefined) return text;

  // apply maxChars constraint first (if provided)
  let workingText = text;
  if (maxChars !== undefined && text.length > maxChars) {
    if (position === 'start') {
      workingText = ellipsis + text.slice(-maxChars);
    } else if (position === 'middle') {
      const half = Math.floor(maxChars / 2);
      workingText = text.slice(0, half) + ellipsis + text.slice(-half);
    } else {
      workingText = text.slice(0, maxChars) + ellipsis;
    }
  }

  // apply maxWidth constraint (if provided)
  if (maxWidth !== undefined) {
    const fullWidth = getStringWidth(workingText, style);
    // if width measurement fails or text fits, return current text
    if (fullWidth === null || fullWidth <= maxWidth) return workingText;

    const ellipsisWidth = getStringWidth(ellipsis, style) ?? 0;
    let availableWidth = maxWidth - ellipsisWidth;

    if (position === 'start') {
      let truncated = workingText.slice(ellipsis.length); // remove initial ellipsis if present
      let truncatedWidth = getStringWidth(truncated, style);
      while (truncatedWidth !== null && truncatedWidth > availableWidth && truncated.length > 0) {
        truncated = truncated.slice(1);
        truncatedWidth = getStringWidth(truncated, style);
      }
      return ellipsis + truncated;
    } else if (position === 'middle') {
      const halfWidth = availableWidth / 2;
      let left = '';
      let right = '';
      let bestLeft = '';
      let bestRight = '';

      for (let i = 0, j = workingText.length - 1; i < workingText.length && j >= 0; i++, j--) {
        const leftTest = workingText.slice(0, i + 1);
        const rightTest = workingText.slice(j);
        const leftWidth = getStringWidth(leftTest, style);
        const rightWidth = getStringWidth(rightTest, style);

        if (leftWidth !== null && leftWidth <= halfWidth) left = leftTest;
        if (rightWidth !== null && rightWidth <= halfWidth) right = rightTest;

        const combinedWidth = getStringWidth(left + ellipsis + right, style);
        if (combinedWidth !== null && combinedWidth <= maxWidth) {
          bestLeft = left; // longest valid left
          bestRight = right; // longest valid right
        } else {
          // we've exceed maxWidth, so break out
          break;
        }
      }
      return bestLeft + ellipsis + bestRight;
    } else {
      let truncated = workingText.slice(0, -ellipsis.length);
      let truncatedWidth = getStringWidth(truncated + ellipsis, style);
      while (truncatedWidth !== null && truncatedWidth > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
        truncatedWidth = getStringWidth(truncated + ellipsis, style);
      }
      return truncated + ellipsis;
    }
  }

  return workingText;
}
