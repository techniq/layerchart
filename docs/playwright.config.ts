import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000, // 2 minutes for build + preview
		stdout: 'ignore',
		stderr: 'pipe'
	},
	testDir: 'e2e',
	use: {
		baseURL: 'http://localhost:4173'
	},
	timeout: 30 * 1000 // 30 seconds per test
});
