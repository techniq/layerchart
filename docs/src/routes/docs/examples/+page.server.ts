import { allComponents } from 'content-collections';

interface ExampleInfo {
	component: string;
	category?: string;
	examples: Array<{
		name: string;
		path: string;
	}>;
}

export async function load() {
	const exampleModules = import.meta.glob('/src/examples/components/**/*.svelte');

	// Create a map of component names to their categories
	const componentCategoryMap = new Map<string, string>();
	for (const component of allComponents) {
		if (component.category) {
			componentCategoryMap.set(component.name, component.category);
		}
	}

	// Group examples by component
	const componentMap = new Map<
		string,
		Array<{
			name: string;
			path: string;
		}>
	>();

	for (const filePath of Object.keys(exampleModules)) {
		// Parse path: /src/examples/components/ComponentName/example-name.svelte
		const match = filePath.match(/\/examples\/components\/([^/]+)\/(.+)\.svelte$/);
		if (!match) continue;

		const [, componentName, exampleName] = match;

		if (!componentMap.has(componentName)) {
			componentMap.set(componentName, []);
		}

		componentMap.get(componentName)!.push({
			name: exampleName,
			path: `/example/${componentName}/${exampleName}`
		});
	}

	// Convert to sorted array with category information
	const components: ExampleInfo[] = Array.from(componentMap.entries())
		.map(([component, examples]) => ({
			component,
			category: componentCategoryMap.get(component),
			examples: examples.sort((a, b) => a.name.localeCompare(b.name))
		}))
		.sort((a, b) => a.component.localeCompare(b.component));

	return {
		components
	};
}
