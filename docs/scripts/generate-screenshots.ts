/**
 * LayerChart Screenshot Extractor
 *
 * This script generates screenshots for all examples in the docs/src/examples directory
 * using Playwright.
 *
 * @description
 * Scans all .svelte files in docs/src/examples and generates screenshots by:
 * - Cleaning up orphaned screenshots from renamed/moved/deleted examples
 * - Using MD5 checksums to detect file changes and regenerate screenshots when needed
 * - Navigating to /example/[componentName]/[exampleName]
 * - Capturing screenshots in both light and dark mode
 * - Saving as WebP in multiple sizes for responsive loading:
 *   docs/static/screenshots/[componentName]/[exampleName]-{light|dark}-{800|400|240}w.webp
 * - Skipping screenshots that already exist and haven't changed
 * - Storing checksums inline with each example in index.json for change detection
 *
 * @usage
 * pnpm generate:screenshots         # Generate only changed screenshots
 * pnpm generate:screenshots --all   # Generate all screenshots (ignore checksums)
 *
 * @example
 * // Generates screenshots and index like:
 * // docs/static/screenshots/Area/basic-light-800w.webp
 * // docs/static/screenshots/Area/basic-light-400w.webp
 * // docs/static/screenshots/Area/basic-light-240w.webp
 * // docs/static/screenshots/Area/basic-dark-800w.webp
 * // docs/static/screenshots/Area/basic-dark-400w.webp
 * // docs/static/screenshots/Area/basic-dark-240w.webp
 * // docs/static/screenshots/index.json (with inline checksums per example)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import crypto from 'crypto';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXAMPLES_DIR = path.resolve(__dirname, '../src/examples/components');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../static/screenshots');
const INDEX_FILE = path.resolve(__dirname, '../static/screenshots/index.json');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Viewport size for screenshots
const VIEWPORT = {
	width: 800,
	height: 1000
};

// Image sizes to generate (width in pixels)
// Full size (800), half (400), 30% (240)
const IMAGE_SIZES = [800, 400, 240] as const;

// Limit for testing (set to undefined to process all)
const TEST_LIMIT: number | undefined = undefined;

// Parse command line arguments
const FORCE_ALL = process.argv.includes('--all');

interface ExampleInfo {
	component: string;
	example: string;
	filePath: string;
}

interface ChecksumMap {
	[key: string]: string; // key: "component/example", value: checksum
}

/**
 * Calculate MD5 checksum of a file
 */
function calculateChecksum(filePath: string): string {
	const content = fs.readFileSync(filePath, 'utf-8');
	return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Load checksums from index.json file (inline in examples)
 */
function loadChecksums(): ChecksumMap {
	if (fs.existsSync(INDEX_FILE)) {
		try {
			const content = fs.readFileSync(INDEX_FILE, 'utf-8');
			const indexData = JSON.parse(content);
			const checksums: ChecksumMap = {};

			// Extract checksums from inline example entries
			if (indexData.components) {
				for (const componentGroup of indexData.components) {
					for (const example of componentGroup.examples || []) {
						if (example.checksum) {
							const key = `${componentGroup.component}/${example.name}`;
							checksums[key] = example.checksum;
						}
					}
				}
			}

			return checksums;
		} catch (error) {
			console.warn('Failed to load checksums from index.json, starting fresh');
			return {};
		}
	}
	return {};
}

/**
 * Check if example file has changed since last screenshot
 */
function hasExampleChanged(
	component: string,
	example: string,
	filePath: string,
	checksums: ChecksumMap
): boolean {
	const key = `${component}/${example}`;
	const currentChecksum = calculateChecksum(filePath);
	const previousChecksum = checksums[key];

	return !previousChecksum || previousChecksum !== currentChecksum;
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
 * Check if all screenshot sizes already exist for a mode
 */
function screenshotExists(
	componentName: string,
	exampleName: string,
	mode: 'light' | 'dark'
): boolean {
	// Check if all WebP sizes exist
	return IMAGE_SIZES.every((size) => {
		const screenshotPath = path.join(
			SCREENSHOTS_DIR,
			componentName,
			`${exampleName}-${mode}-${size}w.webp`
		);
		return fs.existsSync(screenshotPath);
	});
}

/**
 * Generate screenshots for an example in both light and dark modes
 * Outputs WebP format in multiple sizes for responsive loading
 */
async function captureScreenshots(
	page: any,
	componentName: string,
	exampleName: string,
	modes: ('light' | 'dark')[]
): Promise<void> {
	const url = `${BASE_URL}/docs/screenshot/${componentName}/${exampleName}`;
	const screenshotDir = path.join(SCREENSHOTS_DIR, componentName);

	// Ensure directory exists
	ensureDir(screenshotDir);

	try {
		// Navigate to the example
		await page.goto(url, { waitUntil: 'networkidle' });

		// Hide example controls before taking screenshots
		await page.evaluate(() => {
			const controls = document.querySelectorAll('.screenshot-hidden');
			controls.forEach((control) => {
				(control as HTMLElement).style.display = 'none';
			});
		});

		// Count .lc-root-container elements
		const rootContainers = page.locator('.lc-root-container');
		const count = await rootContainers.count();

		let element;
		if (count === 1) {
			// Use the single Chart (.lc-root-container)
			element = rootContainers.first();
		} else {
			// Use full Example (.example) if there are 0 (ex. Legend) or multiple Chart (.lc-root-container) elements
			element = page.locator('.example').first();

			if (!(await element.isVisible())) {
				throw new Error('.example not found or visible');
			}
		}

		// Capture screenshots for each mode
		for (const mode of modes) {
			// Set color scheme preference
			await page.emulateMedia({ colorScheme: mode });

			// Capture full-size screenshot as PNG buffer
			const pngBuffer = await element.screenshot({
				omitBackground: true
			});

			// Generate WebP in multiple sizes
			const sizes: string[] = [];
			for (const width of IMAGE_SIZES) {
				const webpPath = path.join(screenshotDir, `${exampleName}-${mode}-${width}w.webp`);

				await sharp(pngBuffer)
					.resize({ width, withoutEnlargement: true })
					.webp({ quality: 80 })
					.toFile(webpPath);

				sizes.push(`${width}w`);
			}

			console.log(`  ✓ ${mode}: ${sizes.join(', ')}`);
		}
	} catch (error) {
		console.error(`  ✗ failed:`, error instanceof Error ? error.message : error);
		throw error;
	}
}

/**
 * Clean up orphaned screenshots (files/folders for examples that no longer exist)
 */
function cleanupOrphanedScreenshots(validExamples: ExampleInfo[]): void {
	console.log('Checking for orphaned screenshots...\n');

	// Create a set of valid example paths for quick lookup (all sizes and modes)
	const validPaths = new Set(
		validExamples.flatMap((ex) =>
			IMAGE_SIZES.flatMap((size) => [
				`${ex.component}/${ex.example}-light-${size}w.webp`,
				`${ex.component}/${ex.example}-dark-${size}w.webp`
			])
		)
	);

	// Create a set of valid component names
	const validComponents = new Set(validExamples.map((ex) => ex.component));

	let removedFiles = 0;
	let removedDirs = 0;

	// Check if screenshots directory exists
	if (!fs.existsSync(SCREENSHOTS_DIR)) {
		console.log('No screenshots directory found, skipping cleanup.\n');
		return;
	}

	// Read all component directories in screenshots
	const screenshotEntries = fs.readdirSync(SCREENSHOTS_DIR, { withFileTypes: true });

	for (const entry of screenshotEntries) {
		// Skip non-directories and special files
		if (!entry.isDirectory() || entry.name.startsWith('.')) {
			continue;
		}

		const componentName = entry.name;
		const componentDir = path.join(SCREENSHOTS_DIR, componentName);

		// Check if this component still exists
		if (!validComponents.has(componentName)) {
			console.log(`  ✗ Removing orphaned component directory: ${componentName}/`);
			fs.rmSync(componentDir, { recursive: true, force: true });
			removedDirs++;
			continue;
		}

		// Check files within the component directory
		const files = fs.readdirSync(componentDir);
		for (const file of files) {
			// Skip non-WebP/PNG files and hidden files (PNG for legacy cleanup)
			if ((!file.endsWith('.webp') && !file.endsWith('.png')) || file.startsWith('.')) {
				continue;
			}

			const relativePath = `${componentName}/${file}`;
			if (!validPaths.has(relativePath)) {
				const filePath = path.join(componentDir, file);
				console.log(`  ✗ Removing orphaned screenshot: ${relativePath}`);
				fs.unlinkSync(filePath);
				removedFiles++;
			}
		}

		// Remove component directory if it's now empty
		const remainingFiles = fs.readdirSync(componentDir);
		if (remainingFiles.length === 0) {
			console.log(`  ✗ Removing empty directory: ${componentName}/`);
			fs.rmdirSync(componentDir);
			removedDirs++;
		}
	}

	if (removedFiles === 0 && removedDirs === 0) {
		console.log('  ✓ No orphaned screenshots found\n');
	} else {
		console.log(`\n  Removed ${removedFiles} orphaned files and ${removedDirs} directories\n`);
	}
}

/**
 * Main function
 */
async function main() {
	console.log('LayerChart Screenshot Extractor');
	console.log('================================\n');

	if (FORCE_ALL) {
		console.log('⚡ Running with --all flag: regenerating all screenshots\n');
	}

	// Get all examples
	let examples = getExampleFiles(EXAMPLES_DIR);
	console.log(`Found ${examples.length} examples`);

	// Clean up orphaned screenshots before processing
	cleanupOrphanedScreenshots(examples);

	// Load existing checksums
	const checksums = loadChecksums();
	const updatedChecksums: ChecksumMap = {};

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

	// Set default timeout to avoid long waits
	page.setDefaultTimeout(5000);

	let processedCount = 0;
	let skippedCount = 0;
	let errorCount = 0;
	const failedExamples: string[] = [];

	// Process each example
	for (const example of examples) {
		const { component, example: exampleName, filePath } = example;
		console.log(`\n${component}/${exampleName}`);

		// Check if example file has changed
		const fileChanged = hasExampleChanged(component, exampleName, filePath, checksums);

		// Check if screenshots already exist
		const lightExists = screenshotExists(component, exampleName, 'light');
		const darkExists = screenshotExists(component, exampleName, 'dark');

		// Skip if both screenshots exist and file hasn't changed (unless --all flag is used)
		if (lightExists && darkExists && !fileChanged && !FORCE_ALL) {
			console.log('  ⊘ Skipped (unchanged)');
			skippedCount += 2;
			// Keep existing checksum
			updatedChecksums[`${component}/${exampleName}`] = checksums[`${component}/${exampleName}`];
			continue;
		}

		// Show reason for regeneration
		if (FORCE_ALL && (lightExists || darkExists)) {
			console.log('  ↻ Force regenerating (--all flag)...');
		} else if (fileChanged && (lightExists || darkExists)) {
			console.log('  ↻ File changed, regenerating...');
		}

		try {
			// Determine which modes need to be captured
			const modesToCapture: ('light' | 'dark')[] = [];

			if (!lightExists || fileChanged || FORCE_ALL) {
				modesToCapture.push('light');
			} else {
				console.log('  ⊘ light: already exists');
				skippedCount++;
			}

			if (!darkExists || fileChanged || FORCE_ALL) {
				modesToCapture.push('dark');
			} else {
				console.log('  ⊘ dark: already exists');
				skippedCount++;
			}

			// Capture screenshots if any modes need to be processed
			if (modesToCapture.length > 0) {
				await captureScreenshots(page, component, exampleName, modesToCapture);
				processedCount += modesToCapture.length;
			}

			// Update checksum after successful capture
			updatedChecksums[`${component}/${exampleName}`] = calculateChecksum(filePath);
		} catch (error) {
			console.error(`  ✗ Error:`, error instanceof Error ? error.message : error);
			errorCount++;
			failedExamples.push(`${component}/${exampleName}`);
			// Keep old checksum on error to retry next time
			if (checksums[`${component}/${exampleName}`]) {
				updatedChecksums[`${component}/${exampleName}`] = checksums[`${component}/${exampleName}`];
			}
		}
	}

	// Close browser
	await browser.close();

	// Generate index.json with all examples grouped by component
	console.log('\nGenerating index.json...');
	const examplesByComponent = new Map<
		string,
		Array<{ name: string; path: string; checksum: string }>
	>();

	for (const example of examples) {
		if (!examplesByComponent.has(example.component)) {
			examplesByComponent.set(example.component, []);
		}
		const checksumKey = `${example.component}/${example.example}`;
		examplesByComponent.get(example.component)!.push({
			name: example.example,
			path: `/example/${example.component}/${example.example}`,
			checksum: updatedChecksums[checksumKey] || ''
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
	console.log(`✅ Generated ${indexPath} with inline checksums`);

	// Print summary
	console.log('\n================================');
	console.log('Summary:');
	console.log(`  Total examples: ${examples.length}`);
	console.log(`  Screenshots generated: ${processedCount}`);
	console.log(`  Screenshots skipped: ${skippedCount}`);
	console.log(`  Errors: ${errorCount}`);
	if (failedExamples.length > 0) {
		console.log(`\nFailed examples:`);
		for (const name of failedExamples) {
			console.log(`  ✗ ${name}`);
		}
	}
	console.log(`\n✅ Screenshots saved to ${SCREENSHOTS_DIR}`);
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
