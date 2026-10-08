import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * What only the `isometric` view may import.  Marks reach these through `ctx.isometric`, so a chart
 * that never uses the view doesn't bundle them — a static import elsewhere would put them back in
 * every chart.
 */
const viewOnly = [
  'autoIsometricAspect',
  'backWalls',
  'boxFaces',
  'createIsometricMatrix',
  'extrudePath',
  'extrudeRings',
  'fitIsometricFloor',
  'floorCorner',
  'isometricLift',
  'paintOrder',
  'planeCircle',
  'screenToFloor',
  'sectorDepth',
  'viewportAnchors',
  'highlightShadows',
  'highlightWallLines',
];
const viewOnlyFiles = [
  'PathExtruded.svg.svelte',
  'RectBox.svg.svelte',
  'RectBox.html.svelte',
  'RectBox.canvas',
  'GridWalls.svelte',
  'HighlightShadows.svelte',
  'Highlight.isometric',
  'views/isometric',
];

const lib = join(import.meta.dirname, '..');

/** The view itself, and the files that are part of it */
const partOfView = (file: string) =>
  file.startsWith('views/') ||
  file === 'utils/isometric.ts' ||
  viewOnlyFiles.some((name) => file.includes(name));

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name.startsWith('__') ? [] : sources(path);
    return /\.(ts|svelte)$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : [];
  });
}

describe('the isometric view', () => {
  it("is imported only by itself, so flat charts don't bundle it", () => {
    const offenders: string[] = [];
    for (const path of sources(lib)) {
      const file = relative(lib, path);
      if (partOfView(file)) continue;
      const imports = readFileSync(path, 'utf8').match(/import\s[^;]*?from\s*'[^']+'/g) ?? [];
      for (const statement of imports) {
        if (/^import\s+type\s/.test(statement)) continue;
        const from = statement.match(/from\s*'([^']+)'/)![1];
        const names = from.includes('utils/isometric')
          ? (statement.match(/\{([^}]*)\}/)?.[1].split(',') ?? [])
          : [];
        const bad = names
          .map(
            (n) =>
              n
                .trim()
                .replace(/^type\s+/, '')
                .split(/\s+as\s+/)[0]
          )
          .filter((n) => viewOnly.includes(n));
        if (bad.length || viewOnlyFiles.some((name) => from.includes(name)))
          offenders.push(`${file}: ${statement.replace(/\s+/g, ' ')}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
