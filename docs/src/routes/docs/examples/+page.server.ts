import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ExampleInfo {
	component: string;
	examples: Array<{
		name: string;
		path: string;
	}>;
}

export async function load() {
	const examplesDir = path.resolve(__dirname, '../../../examples');
	const screenshotsDir = path.resolve(__dirname, '../../../../static/screenshots');

	// Read all component directories
	const components: ExampleInfo[] = [];
	const entries = fs.readdirSync(examplesDir, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isDirectory()) {
			const componentName = entry.name;
			const componentDir = path.join(examplesDir, componentName);

			// Get all .svelte files in this component directory
			const exampleFiles = fs.readdirSync(componentDir, { withFileTypes: true });
			const examples = exampleFiles
				.filter((file) => file.isFile() && file.name.endsWith('.svelte'))
				.map((file) => {
					const exampleName = file.name.replace('.svelte', '');
					return {
						name: exampleName,
						path: `/example/${componentName}/${exampleName}`,
						// Check if screenshots exist
						hasLightScreenshot: fs.existsSync(
							path.join(screenshotsDir, componentName, `${exampleName}-light.png`)
						),
						hasDarkScreenshot: fs.existsSync(
							path.join(screenshotsDir, componentName, `${exampleName}-dark.png`)
						)
					};
				})
				.sort((a, b) => a.name.localeCompare(b.name));

			if (examples.length > 0) {
				components.push({
					component: componentName,
					examples
				});
			}
		}
	}

	// Sort components alphabetically
	components.sort((a, b) => a.component.localeCompare(b.component));

	return {
		components,
		totalExamples: components.reduce((sum, c) => sum + c.examples.length, 0)
	};
}
