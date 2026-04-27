import { describe, it, expect } from 'vitest';
import { allComponents, allUtils, allGuides } from 'content-collections';
import {
	generateLlmsTxt,
	generateFullLlmsTxt,
	generateComponentMarkdown,
	generateUtilMarkdown,
	generateGuideMarkdown,
	generateExampleMarkdown,
	markdownResponse
} from './utils.js';

describe('llms.txt endpoints', () => {
	describe('/llms.txt - generateLlmsTxt', () => {
		const output = generateLlmsTxt();

		it('should contain header with library description', () => {
			expect(output).toContain('# LayerChart Documentation for LLMs');
			expect(output).toContain('composable charting library for Svelte');
		});

		it('should contain Guides section', () => {
			expect(output).toContain('## Guides');
			expect(output).toContain('Getting Started');
		});

		it('should contain Components section with all components', () => {
			expect(output).toContain('## Components');
			for (const component of allComponents) {
				expect(output).toContain(`[${component.name}]`);
			}
		});

		it('should contain Utilities section with all utilities', () => {
			expect(output).toContain('## Utilities');
			for (const util of allUtils) {
				expect(output).toContain(`[${util.name}]`);
			}
		});

		it('should contain Examples section', () => {
			expect(output).toContain('## Examples');
		});

		it('should link to llms.txt endpoints', () => {
			expect(output).toContain('/llms.txt)');
		});
	});

	describe('/docs/llms.txt - generateFullLlmsTxt', () => {
		const output = generateFullLlmsTxt();

		it('should contain header with library description', () => {
			expect(output).toContain('# LayerChart Full Documentation for LLMs');
			expect(output).toContain('composable charting library for Svelte');
		});

		it('should contain Guides section', () => {
			expect(output).toContain('## Guides');
			expect(output).toContain('Getting Started');
		});

		it('should contain Components heading with separator', () => {
			expect(output).toContain('---');
			expect(output).toContain('# Components');
		});

		it('should contain all components as inline sections', () => {
			for (const component of allComponents) {
				expect(output).toContain(`## ${component.name}`);
			}
		});

		it('should contain Utilities heading with separator', () => {
			expect(output).toContain('---');
			expect(output).toContain('# Utilities');
		});

		it('should contain all utilities as inline sections', () => {
			for (const util of allUtils) {
				expect(output).toContain(`## ${util.name}`);
			}
		});
	});

	describe('/docs/getting-started/llms.txt - generateGuideMarkdown', () => {
		const output = generateGuideMarkdown({ name: 'getting-started', title: 'Getting Started' });

		it('should contain Getting Started heading', () => {
			expect(output).toContain('# Getting Started');
		});

		it('should contain installation/setup content', () => {
			// Getting started guide should have some installation instructions
			expect(output.length).toBeGreaterThan(100);
		});
	});

	describe('/docs/guides/[name]/llms.txt - generateGuideMarkdown', () => {
		const nonDraftGuides = allGuides.filter((g) => !g.draft);

		it('should generate markdown for each non-draft guide', () => {
			for (const guide of nonDraftGuides) {
				const output = generateGuideMarkdown({ name: guide.slug });
				expect(output).toContain(`# ${guide.name}`);
				expect(output.length).toBeGreaterThan(50);
			}
		});

		it('should throw for non-existent guide', () => {
			expect(() => generateGuideMarkdown({ name: 'non-existent-guide' })).toThrow();
		});
	});

	describe('/docs/components/[name]/llms.txt - generateComponentMarkdown', () => {
		it('should generate markdown for each component', () => {
			for (const component of allComponents) {
				const output = generateComponentMarkdown(component, { inlineExamples: true });

				// Title
				expect(output).toContain(`# ${component.name}`);

				// Description (if present)
				if (component.description) {
					expect(output).toContain(component.description);
				}
			}
		});

		it('should include category when present', () => {
			const withCategory = allComponents.find((c) => c.category);
			if (withCategory) {
				const output = generateComponentMarkdown(withCategory, { inlineExamples: true });
				expect(output).toContain(`**Category:** ${withCategory.category}`);
			}
		});

		it('should include layers when present', () => {
			const withLayers = allComponents.find((c) => c.layers && c.layers.length > 0);
			if (withLayers) {
				const output = generateComponentMarkdown(withLayers, { inlineExamples: true });
				expect(output).toContain('**Supported Layers:**');
			}
		});

		it('should respect headingLevel option', () => {
			const component = allComponents[0];
			const output = generateComponentMarkdown(component, { headingLevel: 2 });
			expect(output).toContain(`## ${component.name}`);
			expect(output).not.toMatch(new RegExp(`^# ${component.name}`, 'm'));
		});
	});

	describe('/docs/components/[name]/[example]/llms.txt - generateExampleMarkdown', () => {
		it('should return null for non-existent example', () => {
			const result = generateExampleMarkdown('non-existent', 'fake-example');
			expect(result).toBeNull();
		});

		it('should generate markdown for a valid component example', () => {
			// Extract a real component/example pair from the llms.txt index
			const index = generateLlmsTxt();
			const examplesSection = index.slice(index.indexOf('## Examples'));
			const exampleMatch = examplesSection.match(/- \[([^/\]]+)\/([^\]]+)\]\([^)]+\/llms\.txt\)/);
			expect(exampleMatch, 'Should find an example link in Examples section').not.toBeNull();

			const [matched, componentSlug, exampleName] = exampleMatch!;
			const result = generateExampleMarkdown(componentSlug, exampleName);
			expect(
				result,
				`generateExampleMarkdown('${componentSlug}', '${exampleName}') returned null. Matched: ${matched}`
			).not.toBeNull();
			expect(result).toContain(`# ${componentSlug} - ${exampleName}`);
			expect(result).toContain('## Code');
			expect(result).toContain('```svelte');
		});
	});

	describe('/docs/utils/[name]/llms.txt - generateUtilMarkdown', () => {
		it('should generate markdown for each utility', () => {
			for (const util of allUtils) {
				const output = generateUtilMarkdown(util, { inlineExamples: true });

				// Title
				expect(output).toContain(`# ${util.name}`);

				// Description (if present)
				if (util.description) {
					expect(output).toContain(util.description);
				}
			}
		});

		it('should respect headingLevel option', () => {
			const util = allUtils[0];
			const output = generateUtilMarkdown(util, { headingLevel: 2 });
			expect(output).toContain(`## ${util.name}`);
			expect(output).not.toMatch(new RegExp(`^# ${util.name}`, 'm'));
		});
	});

	describe('markdownResponse', () => {
		it('should return response with correct content-type', () => {
			const response = markdownResponse('# Test', 'test.md');
			expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
		});

		it('should return response with correct content-disposition', () => {
			const response = markdownResponse('# Test', 'test.md');
			expect(response.headers.get('Content-Disposition')).toBe('inline; filename="test.md"');
		});

		it('should return the content as body', async () => {
			const response = markdownResponse('# Hello World', 'hello.md');
			const text = await response.text();
			expect(text).toBe('# Hello World');
		});
	});
});
