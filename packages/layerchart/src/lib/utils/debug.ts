import { rgb } from 'd3-color';
import { toTitleCase } from './string.js';
import { findScaleName } from './layout.js';

const indent = '    ';

type RGBInput = Parameters<typeof rgb>[0];
type RGBOutput = { r: number; g: number; b: number; o: number };

function printObject(obj: Record<string, any>) {
  Object.entries(obj).forEach(([key, value]) => {
    console.log(`${indent}${key}:`, value);
  });
}

function getRgb(clr: RGBInput) {
  const { r, g, b, opacity: o } = rgb(clr);
  if (![r, g, b].every((c) => c >= 0 && c <= 255)) {
    return false;
  }
  return { r, g, b, o };
}

function printValues(scale: any, method: string, extraSpace = '') {
  const values = scale[method]();
  const colorValues = colorizeArray(values);
  if (colorValues) {
    printColorArray(colorValues, method, values);
  } else {
    console.log(`${indent}${indent}${toTitleCase(method)}:${extraSpace}`, values);
  }
}

function printColorArray(colorValues: (string[] | string)[], method: string, values: any[]) {
  console.log(
    `${indent}${indent}${toTitleCase(method)}:    %cArray%c(${values.length}) ` +
      colorValues[0] +
      '%c ]',
    'color: #1377e4',
    'color: #737373',
    'color: #1478e4',
    ...colorValues[1],
    'color: #1478e4'
  );
}
function colorizeArray(arr: RGBInput[]) {
  const colors: RGBOutput[] = [];
  const a = arr.map((d, i) => {
    const rgbo = getRgb(d);
    if (rgbo !== false) {
      colors.push(rgbo);
      // Add a space to the last item
      const space = i === arr.length - 1 ? ' ' : '';
      return `%c ${d}${space}`;
    }
    return d;
  });
  if (colors.length) {
    return [
      `%c[ ${a.join(', ')}`,
      colors.map(
        (d) => `background-color: rgba(${d.r}, ${d.g}, ${d.b}, ${d.o}); color:${contrast(d)};`
      ),
    ];
  }
  return null;
}

function printScale(s: string, scale: any, acc: any) {
  const scaleName = findScaleName(scale);
  console.log(`${indent}${s}:`);
  console.log(`${indent}${indent}Accessor: "${acc.toString()}"`);
  console.log(`${indent}${indent}Type: ${scaleName}`);
  printValues(scale, 'domain');
  printValues(scale, 'range', ' ');
}

/**
 * Calculate human-perceived lightness from RGB
 * This doesn't take opacity into account
 * https://stackoverflow.com/a/596243
 */
function contrast({ r, g, b }: Pick<RGBOutput, 'r' | 'g' | 'b'>) {
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? 'black' : 'white';
}

export function printDebug(obj: Record<string, any>) {
  console.log('/********* LayerCake Debug ************/');
  console.log('Bounding box:');
  printObject(obj.boundingBox);
  console.log('Data:');
  console.log(indent, obj.data);
  if (obj.flatData) {
    console.log('flatData:');
    console.log(indent, obj.flatData);
  }
  console.log('Scales:');
  Object.keys(obj.activeGetters).forEach((g) => {
    printScale(g, obj[`${g}Scale`], obj[g]);
  });
  console.log('/************ End LayerCake Debug ***************/\n');
}
