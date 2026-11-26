import { describe, expect, it } from 'vitest';
import { isNativeWebGL, toWebGL } from '../../vite-plugin-webgl-examples';

const webgl = new Set(['Axis', 'Chart', 'Layer', 'Points', 'GeoPath', 'Tooltip']);

const example = (imports: string, markup = '<Chart><Layer><Points /></Layer></Chart>') =>
	`<script lang="ts">\n${imports}\n</script>\n\n${markup}\n`;

describe('toWebGL', () => {
	it('imports the components `@layerchart/webgl` has from it, and the rest as before', () => {
		const source = example(
			"\timport { Axis, Chart, Layer, Points, format, type ChartState } from 'layerchart';"
		);
		expect(toWebGL(source, webgl)).toBe(
			example(
				"\timport { Axis, Chart, Layer, Points } from '@layerchart/webgl';\n\timport { format, type ChartState } from 'layerchart';"
			)
		);
	});

	it('rewrites `layerchart/geo` imports, across lines', () => {
		const source = example(
			"\timport { Chart, Layer } from 'layerchart';\n\timport {\n\t\tGeoPath\n\t} from 'layerchart/geo';",
			'<Chart><Layer><GeoPath /></Layer></Chart>'
		);
		expect(toWebGL(source, webgl)).toContain("import { GeoPath } from '@layerchart/webgl';");
	});

	it("skips an example drawing a component `@layerchart/webgl` doesn't have", () => {
		const source = example(
			"\timport { Chart, Layer, Labels, Points } from 'layerchart';",
			'<Chart><Layer><Points /><Labels /></Layer></Chart>'
		);
		expect(toWebGL(source, webgl)).toBeNull();
	});

	it('keeps other names it imports from `layerchart` (ex. a type, or a component unused)', () => {
		const source = example(
			"\timport { Chart, ChartState, Labels, Layer, Points } from 'layerchart';"
		);
		expect(toWebGL(source, webgl)).toContain("import { ChartState, Labels } from 'layerchart';");
	});

	it('skips an example drawn in a layer of its own', () => {
		const imports = "\timport { Chart, Layer, Points, Svg } from 'layerchart';";
		expect(toWebGL(example(imports, '<Chart><Svg><Points /></Svg></Chart>'), webgl)).toBeNull();
		expect(
			toWebGL(example(imports, '<Chart><Layer type="svg"><Points /></Layer></Chart>'), webgl)
		).toBeNull();
	});

	it('skips an example with components of its own, which could draw core marks', () => {
		const source = example(
			"\timport { Chart, Layer, Points } from 'layerchart';\n\timport Marks from './Marks.svelte';"
		);
		expect(toWebGL(source, webgl)).toBeNull();
	});
});

describe('isNativeWebGL', () => {
	it('is an example written with `@layerchart/webgl`, which draws with WebGL whatever the layer', () => {
		expect(
			isNativeWebGL(example("\timport { Chart, WebGL, Points } from '@layerchart/webgl';"))
		).toBe(true);
		expect(isNativeWebGL(example("\timport { Points } from '@layerchart/webgl/webgl';"))).toBe(
			true
		);
		expect(isNativeWebGL(example("\timport { Chart, Layer, Points } from 'layerchart';"))).toBe(
			false
		);
	});
});
