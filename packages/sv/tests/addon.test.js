import { expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import addon from '../src/index.js';
import { setupTest } from './setup/suite.js';

// set to true to enable browser testing
const browser = false;

const { test, prepareServer, testCases } = setupTest(
	{ addon },
	{
		kinds: [
			{
				type: 'default',
				options: { '@layerchart/sv': { demo: 'components/ArcChart/gradient-with-text' } }
			}
		],
		filter: (testCase) => testCase.variant.includes('kit'),
		browser
	}
);

test.concurrent.for(testCases)(
	'@layerchart/sv $kind.type $variant',
	async (testCase, { page, ...ctx }) => {
		const cwd = ctx.cwd(testCase);

		// Check demo component was created
		const demoPath = path.resolve(cwd, 'src/lib/layerchart/demos/ArcChart/gradient-with-text.svelte');
		const demoContent = fs.readFileSync(demoPath, 'utf8');
		expect(demoContent).toContain('layerchart');
		expect(demoContent).toContain('ArcChart');

		// Check route was updated to import the demo
		const routePath = path.resolve(cwd, 'src/routes/+page.svelte');
		const routeContent = fs.readFileSync(routePath, 'utf8');
		expect(routeContent).toContain('Demo');
		expect(routeContent).toContain('$lib/layerchart/demos/ArcChart/gradient-with-text.svelte');

		// Check package.json has layerchart dependency
		const pkgPath = path.resolve(cwd, 'package.json');
		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
		expect(pkg.dependencies?.layerchart || pkg.devDependencies?.layerchart).toBeTruthy();

		// For browser testing
		if (browser) {
			const { close } = await prepareServer({ cwd, page });
			ctx.onTestFinished(async () => await close());
		}
	}
);
