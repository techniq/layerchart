import { allComponents } from 'content-collections';

interface ExampleInfo {
	component: string;
	section?: string;
	examples: Array<{
		name: string;
		path: string;
		hasLightScreenshot: boolean;
		hasDarkScreenshot: boolean;
	}>;
}

export async function load() {
	// Import all example files using Vite's import.meta.glob
	const exampleModules = import.meta.glob('/src/examples/**/*.svelte');
	const screenshotModules = import.meta.glob('/static/screenshots/**/*.png', {
		query: '?url',
		import: 'default'
	});

	// Create a map of component names to their sections
	const componentSectionMap = new Map<string, string>();
	for (const component of allComponents) {
		if (component.section) {
			componentSectionMap.set(component.name, component.section);
		}
	}

	// Group examples by component
	const componentMap = new Map<
		string,
		Array<{
			name: string;
			path: string;
			hasLightScreenshot: boolean;
			hasDarkScreenshot: boolean;
		}>
	>();

	for (const filePath of Object.keys(exampleModules)) {
		// Parse path: /src/examples/ComponentName/example-name.svelte
		const match = filePath.match(/\/examples\/([^/]+)\/(.+)\.svelte$/);
		if (!match) continue;

		const [, componentName, exampleName] = match;

		if (!componentMap.has(componentName)) {
			componentMap.set(componentName, []);
		}

		const hasLightScreenshot =
			`/static/screenshots/${componentName}/${exampleName}-light.png` in screenshotModules;
		const hasDarkScreenshot =
			`/static/screenshots/${componentName}/${exampleName}-dark.png` in screenshotModules;

		componentMap.get(componentName)!.push({
			name: exampleName,
			path: `/example/${componentName}/${exampleName}`,
			hasLightScreenshot,
			hasDarkScreenshot
		});
	}

	// Convert to sorted array with section information
	const components: ExampleInfo[] = Array.from(componentMap.entries())
		.map(([component, examples]) => ({
			component,
			section: componentSectionMap.get(component),
			examples: examples.sort((a, b) => a.name.localeCompare(b.name))
		}))
		.sort((a, b) => a.component.localeCompare(b.component));

	return {
		components
	};
}
