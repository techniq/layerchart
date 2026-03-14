/**
 * Showcase Screenshot Generator
 *
 * Generates WebP screenshots for featured and supporter sites
 * listed in the showcase page, named by slug (e.g. tenzir.webp).
 *
 * Sites with noregenerate: true are only captured if no image exists yet.
 *
 * @usage
 * pnpm tsx scripts/generate-showcase-screenshots.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { featuredSites, sponsorSites } from '../src/routes/docs/showcase/showcase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../static/showcase');

const VIEWPORT = { width: 800, height: 1600 };

function toSlug(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
	console.log('Showcase Screenshot Generator');
	console.log('==============================\n');

	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	const sites = [...featuredSites, ...sponsorSites];

	const browser = await chromium.launch();
	const context = await browser.newContext({ viewport: VIEWPORT });
	const page = await context.newPage();
	page.setDefaultTimeout(30000);

	let generated = 0;
	let skipped = 0;
	let errors = 0;

	for (const site of sites) {
		const name = site.name ?? site.reponame ?? '';
		const slug = toSlug(name);
		const outputPath = path.join(OUTPUT_DIR, `${slug}.webp`);

		if (site.noregenerate && fs.existsSync(outputPath)) {
			console.log(`⊘ Skipped (noregenerate): ${slug}.webp`);
			skipped++;
			continue;
		}

		try {
			const captureUrl = site.showcaseurl ?? site.homepageurl;
			if (!captureUrl) {
				console.log(`⊘ Skipped (no homepage): ${slug}.webp`);
				skipped++;
				continue;
			}
			console.log(`Capturing ${name} → ${slug}.webp`);
			try {
				await page.goto(captureUrl, { waitUntil: 'networkidle' });
			} catch {
				// Fallback for sites that never reach networkidle
				await page.goto(captureUrl, { waitUntil: 'domcontentloaded' });
				await page.waitForTimeout(3000);
			}

			const pngBuffer = await page.screenshot({ fullPage: false });

			await sharp(pngBuffer).webp({ quality: 80 }).toFile(outputPath);

			console.log(`  ✓ Saved ${slug}.webp`);
			generated++;
		} catch (error) {
			console.error(`  ✗ Failed ${name}:`, error instanceof Error ? error.message : error);
			errors++;
		}
	}

	await browser.close();

	console.log('\n==============================');
	console.log(`Generated: ${generated}`);
	console.log(`Skipped:   ${skipped}`);
	console.log(`Errors:    ${errors}`);
	console.log(`\nImages saved to ${OUTPUT_DIR}`);
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
