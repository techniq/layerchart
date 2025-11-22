import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractAPIs } from '../scripts/generate-component-api.js';
import type { ComponentAPI } from '$lib/api-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.resolve(__dirname, '__fixtures__');

describe('API Extraction - Fixture Components', () => {
	let fixtureAPIs: Map<string, ComponentAPI>;

	beforeAll(() => {
		const apis = extractAPIs(FIXTURES_DIR);
		fixtureAPIs = new Map(apis.map((api) => [api.component, api]));
	});

	describe('Component Discovery', () => {
		it('should extract APIs from fixture components', () => {
			expect(fixtureAPIs.size).toBeGreaterThan(0);
		});

		it('should extract Simple component', () => {
			expect(fixtureAPIs.has('Simple')).toBe(true);
		});

		it('should extract Nested component', () => {
			expect(fixtureAPIs.has('Nested')).toBe(true);
		});

		it('should extract WithCommonStyle component', () => {
			expect(fixtureAPIs.has('WithCommonStyle')).toBe(true);
		});

		it('should extract Complex component', () => {
			expect(fixtureAPIs.has('Complex')).toBe(true);
		});

		it('should extract Minimal component', () => {
			expect(fixtureAPIs.has('Minimal')).toBe(true);
		});

		it('should skip NoProps component', () => {
			expect(fixtureAPIs.has('NoProps')).toBe(false);
		});
	});

	describe('Simple Component - Basic Properties', () => {
		let simpleAPI: ComponentAPI;

		beforeAll(() => {
			simpleAPI = fixtureAPIs.get('Simple')!;
		});

		it('should have correct component name and props type', () => {
			expect(simpleAPI.component).toBe('Simple');
			expect(simpleAPI.propsType).toBe('SimplePropsWithoutHTML');
		});

		it('should extract optional properties with defaults', () => {
			const xProp = simpleAPI.properties.find((p) => p.name === 'x');
			expect(xProp).toBeDefined();
			expect(xProp?.type).toBe('number');
			expect(xProp?.required).toBe(false);
			expect(xProp?.default).toBe('0');
			expect(xProp?.description).toBe('The x-coordinate');
		});

		it('should extract required properties', () => {
			const widthProp = simpleAPI.properties.find((p) => p.name === 'width');
			expect(widthProp).toBeDefined();
			expect(widthProp?.type).toBe('number');
			expect(widthProp?.required).toBe(true);
			expect(widthProp?.description).toBe('The width (required)');
		});

		it('should extract bindable tags', () => {
			const refProp = simpleAPI.properties.find((p) => p.name === 'ref');
			expect(refProp).toBeDefined();
			expect(refProp?.tags).toBeDefined();
			expect(refProp?.tags?.bindable).toBeDefined();
		});

		it('should have all expected properties', () => {
			const propertyNames = simpleAPI.properties.map((p) => p.name);
			expect(propertyNames).toContain('x');
			expect(propertyNames).toContain('y');
			expect(propertyNames).toContain('width');
			expect(propertyNames).toContain('height');
			expect(propertyNames).toContain('fill');
			expect(propertyNames).toContain('ref');
		});
	});

	describe('Nested Component - Object Properties', () => {
		let nestedAPI: ComponentAPI;

		beforeAll(() => {
			nestedAPI = fixtureAPIs.get('Nested')!;
		});

		it('should extract nested props object', () => {
			const propsProp = nestedAPI.properties.find((p) => p.name === 'props');
			expect(propsProp).toBeDefined();
			expect(propsProp?.properties).toBeDefined();
			expect(Array.isArray(propsProp?.properties)).toBe(true);
		});

		it('should have correct nested properties structure', () => {
			const propsProp = nestedAPI.properties.find((p) => p.name === 'props');
			expect(propsProp?.properties?.length).toBe(2);

			const labelProp = propsProp?.properties?.find((p) => p.name === 'label');
			expect(labelProp).toBeDefined();
			expect(labelProp?.description).toBe('Label properties');
			expect(labelProp?.required).toBe(false);

			const lineProp = propsProp?.properties?.find((p) => p.name === 'line');
			expect(lineProp).toBeDefined();
			expect(lineProp?.description).toBe('Line properties');
		});

		it('should extract classes object with nested properties', () => {
			const classesProp = nestedAPI.properties.find((p) => p.name === 'classes');
			expect(classesProp).toBeDefined();
			expect(classesProp?.default).toBe('{}');
			expect(classesProp?.properties).toBeDefined();
			expect(classesProp?.properties?.length).toBe(3);

			const rootClass = classesProp?.properties?.find((p) => p.name === 'root');
			expect(rootClass).toBeDefined();
			expect(rootClass?.type).toBe('string');
		});

		it('should not have newlines in type strings', () => {
			const propsProp = nestedAPI.properties.find((p) => p.name === 'props');
			expect(propsProp?.type).not.toContain('\n');
		});
	});

	describe('WithCommonStyle Component - Type Expansion', () => {
		let withCommonStyleAPI: ComponentAPI;

		beforeAll(() => {
			withCommonStyleAPI = fixtureAPIs.get('WithCommonStyle')!;
		});

		it('should expand CommonStyleProps intersection', () => {
			const propertyNames = withCommonStyleAPI.properties.map((p) => p.name);

			// Should have both direct properties and CommonStyleProps
			expect(propertyNames).toContain('x');
			expect(propertyNames).toContain('y');
			expect(propertyNames).toContain('size');
			expect(propertyNames).toContain('fill');
			expect(propertyNames).toContain('stroke');
			expect(propertyNames).toContain('fillOpacity');
			expect(propertyNames).toContain('strokeWidth');
		});

		it('should preserve property metadata from intersection types', () => {
			const fillProp = withCommonStyleAPI.properties.find((p) => p.name === 'fill');
			expect(fillProp).toBeDefined();
			expect(fillProp?.type).toBe('string');
			expect(fillProp?.required).toBe(false);
		});
	});

	describe('Complex Component - Advanced Features', () => {
		let complexAPI: ComponentAPI;

		beforeAll(() => {
			complexAPI = fixtureAPIs.get('Complex')!;
		});

		it('should extract union types', () => {
			const positionProp = complexAPI.properties.find((p) => p.name === 'position');
			expect(positionProp).toBeDefined();
			expect(positionProp?.type).toContain('|');
			expect(positionProp?.type).toContain('relative');
			expect(positionProp?.type).toContain('absolute');
			expect(positionProp?.default).toBe("'relative'");
		});

		it('should extract array types', () => {
			const valuesProp = complexAPI.properties.find((p) => p.name === 'values');
			expect(valuesProp).toBeDefined();
			expect(valuesProp?.type).toBe('number[]');
		});

		it('should extract generic types', () => {
			const dataProp = complexAPI.properties.find((p) => p.name === 'data');
			expect(dataProp).toBeDefined();
			expect(dataProp?.type).toContain('Array<');
			expect(dataProp?.type).toContain('>');
		});

		it('should extract function types', () => {
			const onUpdateProp = complexAPI.properties.find((p) => p.name === 'onUpdate');
			expect(onUpdateProp).toBeDefined();
			expect(onUpdateProp?.type).toContain('=>');
			expect(onUpdateProp?.required).toBe(false);

			const onChangeProp = complexAPI.properties.find((p) => p.name === 'onChange');
			expect(onChangeProp).toBeDefined();
			expect(onChangeProp?.required).toBe(true);
		});

		it('should extract multi-line descriptions', () => {
			const metadataProp = complexAPI.properties.find((p) => p.name === 'metadata');
			expect(metadataProp).toBeDefined();
			expect(metadataProp?.description).toBeDefined();
			expect(metadataProp?.description!.length).toBeGreaterThan(50);
		});

		it('should extract custom tags', () => {
			const experimentalProp = complexAPI.properties.find((p) => p.name === 'experimental');
			expect(experimentalProp).toBeDefined();
			expect(experimentalProp?.tags).toBeDefined();
			expect(experimentalProp?.tags?.experimental).toBeDefined();
		});

		it('should handle deeply nested objects', () => {
			const configProp = complexAPI.properties.find((p) => p.name === 'config');
			expect(configProp).toBeDefined();
			expect(configProp?.properties).toBeDefined();
			expect(configProp?.properties?.length).toBeGreaterThan(0);

			const displayProp = configProp?.properties?.find((p) => p.name === 'display');
			expect(displayProp).toBeDefined();
			expect(displayProp?.properties).toBeDefined();
		});
	});

	describe('Minimal Component - Edge Cases', () => {
		let minimalAPI: ComponentAPI;

		beforeAll(() => {
			minimalAPI = fixtureAPIs.get('Minimal')!;
		});

		it('should handle components with single property', () => {
			expect(minimalAPI.properties.length).toBe(1);
		});

		it('should extract the single property correctly', () => {
			const valueProp = minimalAPI.properties.find((p) => p.name === 'value');
			expect(valueProp).toBeDefined();
			expect(valueProp?.type).toBe('string');
			expect(valueProp?.required).toBe(true);
			expect(valueProp?.description).toBe('Single property component');
		});
	});

	describe('Type Formatting', () => {
		it('should normalize whitespace in all components', () => {
			fixtureAPIs.forEach((api) => {
				api.properties.forEach((prop) => {
					expect(prop.type).not.toContain('\n');
					expect(prop.type).not.toMatch(/\s{2,}/);
				});
			});
		});

		it('should preserve type information accurately', () => {
			const complexAPI = fixtureAPIs.get('Complex')!;

			// Check that complex types are preserved
			const types = complexAPI.properties.map((p) => p.type);
			expect(types.some((t) => t.includes('|'))).toBe(true); // Union types
			expect(types.some((t) => t.includes('[]'))).toBe(true); // Array types
			expect(types.some((t) => t.includes('Record<'))).toBe(true); // Generic types
			expect(types.some((t) => t.includes('=>'))).toBe(true); // Function types
		});
	});

	describe('JSDoc Extraction Completeness', () => {
		it('should extract descriptions where available', () => {
			fixtureAPIs.forEach((api) => {
				const propsWithDescriptions = api.properties.filter((p) => p.description);
				expect(propsWithDescriptions.length).toBeGreaterThan(0);
			});
		});

		it('should extract default values where specified', () => {
			const simpleAPI = fixtureAPIs.get('Simple')!;
			const propsWithDefaults = simpleAPI.properties.filter((p) => p.default);
			expect(propsWithDefaults.length).toBeGreaterThan(0);
		});

		it('should extract tags where specified', () => {
			const simpleAPI = fixtureAPIs.get('Simple')!;
			const propsWithTags = simpleAPI.properties.filter((p) => p.tags);
			expect(propsWithTags.length).toBeGreaterThan(0);
		});
	});

	describe('Data Structure Validation', () => {
		it('should have consistent naming conventions', () => {
			fixtureAPIs.forEach((api) => {
				expect(api.propsType).toBe(`${api.component}PropsWithoutHTML`);
			});
		});

		it('should have valid property structures', () => {
			fixtureAPIs.forEach((api) => {
				api.properties.forEach((prop) => {
					expect(prop.name).toBeDefined();
					expect(typeof prop.name).toBe('string');
					expect(prop.name.length).toBeGreaterThan(0);

					expect(prop.type).toBeDefined();
					expect(typeof prop.type).toBe('string');

					expect(typeof prop.required).toBe('boolean');

					if (prop.properties) {
						expect(Array.isArray(prop.properties)).toBe(true);
						expect(prop.properties.length).toBeGreaterThan(0);
					}
				});
			});
		});
	});
});
