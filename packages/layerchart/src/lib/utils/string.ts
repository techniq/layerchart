import { memoize } from 'lodash-es';

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

export const getStringWidth = memoize(
  _getStringWidth,
  (str, style) => `${str}_${JSON.stringify(style)}`
);

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
