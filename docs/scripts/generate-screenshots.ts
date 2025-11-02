/**
 * LayerChart Screenshot Extractor
 *
 * This script generates screenshots for all examples in the docs/src/examples directory
 * using Playwright.
 *
 * @description
 * Scans all .svelte files in docs/src/examples and generates screenshots by:
 * - Navigating to /example/[componentName]/[exampleName]
 * - Capturing screenshots in both light and dark mode
 * - Saving to docs/static/screenshots/[componentName]/[exampleName]-{light|dark}.png
 * - Skipping screenshots that already exist
 *
 * @usage
 * pnpm extract:screenshots
 *
 * @example
 * // Generates screenshots like:
 * // docs/static/screenshots/Area/basic-light.png
 * // docs/static/screenshots/Area/basic-dark.png
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXAMPLES_DIR = path.resolve(__dirname, '../src/examples');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../static/screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Viewport size for screenshots
const VIEWPORT = {
	width: 800,
	height: 1000
};

// Wait time for charts to render (ms)
const RENDER_WAIT = 1000;

// Limit for testing (set to undefined to process all)
const TEST_LIMIT: number | undefined = undefined;

interface ExampleInfo {
	component: string;
	example: string;
	filePath: string;
}

/**
 * Get all example files from the examples directory
 */
function getExampleFiles(dir: string): ExampleInfo[] {
	const examples: ExampleInfo[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			// This is a component directory (e.g., Area, BarChart)
			const componentName = entry.name;
			const componentDir = fullPath;

			// Get all .svelte files in this component directory
			const exampleFiles = fs.readdirSync(componentDir, { withFileTypes: true });

			for (const exampleFile of exampleFiles) {
				if (exampleFile.isFile() && exampleFile.name.endsWith('.svelte')) {
					// Remove .svelte extension and convert filename to URL-friendly format
					const exampleName = exampleFile.name.replace('.svelte', '');

					examples.push({
						component: componentName,
						example: exampleName,
						filePath: path.join(componentDir, exampleFile.name)
					});
				}
			}
		}
	}

	return examples.sort((a, b) => {
		const compA = `${a.component}/${a.example}`;
		const compB = `${b.component}/${b.example}`;
		return compA.localeCompare(compB);
	});
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

/**
 * Check if screenshot already exists
 */
function screenshotExists(
	componentName: string,
	exampleName: string,
	mode: 'light' | 'dark'
): boolean {
	const screenshotPath = path.join(SCREENSHOTS_DIR, componentName, `${exampleName}-${mode}.png`);
	return fs.existsSync(screenshotPath);
}

/**
 * Generate screenshot for an example
 */
async function captureScreenshot(
	page: any,
	componentName: string,
	exampleName: string,
	mode: 'light' | 'dark'
): Promise<void> {
	const url = `${BASE_URL}/example/${componentName}/${exampleName}`;
	const screenshotDir = path.join(SCREENSHOTS_DIR, componentName);
	const screenshotPath = path.join(screenshotDir, `${exampleName}-${mode}.png`);

	// Ensure directory exists
	ensureDir(screenshotDir);

	try {
		// Set color scheme preference
		await page.emulateMedia({ colorScheme: mode });

		// Navigate to the example
		await page.goto(url, { waitUntil: 'networkidle' });

		// Wait for the page to render
		await page.waitForTimeout(RENDER_WAIT);

		// Try to find .lc-root-container first, fall back to .example
		let element = page.locator('.lc-root-container').first();

		if (!(await element.isVisible())) {
			element = page.locator('.example').first();

			if (!(await element.isVisible())) {
				throw new Error('Neither .lc-root-container nor .example found or visible');
			}
		}

		// Take screenshot of the element
		await element.screenshot({
			path: screenshotPath
		});

		console.log(`  ✓ ${mode}: ${screenshotPath}`);
	} catch (error) {
		console.error(`  ✗ ${mode} failed:`, error instanceof Error ? error.message : error);
	}
}

/**
 * Main function
 */
async function main() {
	console.log('LayerChart Screenshot Extractor');
	console.log('================================\n');

	// Get all examples
	let examples = getExampleFiles(EXAMPLES_DIR);
	console.log(`Found ${examples.length} examples`);

	// Limit for testing
	if (TEST_LIMIT !== undefined) {
		examples = examples.slice(0, TEST_LIMIT);
		console.log(`Processing first ${TEST_LIMIT} examples for testing\n`);
	} else {
		console.log();
	}

	// Launch browser
	console.log('Launching browser...');
	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: VIEWPORT
	});
	const page = await context.newPage();

	let processedCount = 0;
	let skippedCount = 0;
	let errorCount = 0;

	// Process each example
	for (const example of examples) {
		const { component, example: exampleName } = example;
		console.log(`\n${component}/${exampleName}`);

		// Check if screenshots already exist
		const lightExists = screenshotExists(component, exampleName, 'light');
		const darkExists = screenshotExists(component, exampleName, 'dark');

		if (lightExists && darkExists) {
			console.log('  ⊘ Skipped (already exists)');
			skippedCount += 2;
			continue;
		}

		try {
			// Capture light mode if it doesn't exist
			if (!lightExists) {
				await captureScreenshot(page, component, exampleName, 'light');
				processedCount++;
			} else {
				console.log('  ⊘ light: already exists');
				skippedCount++;
			}

			// Capture dark mode if it doesn't exist
			if (!darkExists) {
				await captureScreenshot(page, component, exampleName, 'dark');
				processedCount++;
			} else {
				console.log('  ⊘ dark: already exists');
				skippedCount++;
			}
		} catch (error) {
			console.error(`  ✗ Error:`, error instanceof Error ? error.message : error);
			errorCount++;
		}
	}

	// Close browser
	await browser.close();

	// Generate index.json with all examples grouped by component
	console.log('\nGenerating index.json...');
	const examplesByComponent = new Map<string, Array<{ name: string; path: string }>>();

	for (const example of examples) {
		if (!examplesByComponent.has(example.component)) {
			examplesByComponent.set(example.component, []);
		}
		examplesByComponent.get(example.component)!.push({
			name: example.example,
			path: `/example/${example.component}/${example.example}`
		});
	}

	// Convert to array and sort
	const componentsList = Array.from(examplesByComponent.entries())
		.map(([component, examples]) => ({
			component,
			examples: examples.sort((a, b) => a.name.localeCompare(b.name))
		}))
		.sort((a, b) => a.component.localeCompare(b.component));

	const indexData = {
		generatedAt: new Date().toISOString(),
		totalComponents: componentsList.length,
		totalExamples: examples.length,
		components: componentsList
	};

	const indexPath = path.join(SCREENSHOTS_DIR, 'index.json');
	fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
	console.log(`✅ Generated ${indexPath}`);

	// Print summary
	console.log('\n================================');
	console.log('Summary:');
	console.log(`  Total examples: ${examples.length}`);
	console.log(`  Screenshots generated: ${processedCount}`);
	console.log(`  Screenshots skipped: ${skippedCount}`);
	console.log(`  Errors: ${errorCount}`);
	console.log(`\n✅ Screenshots saved to ${SCREENSHOTS_DIR}`);
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
