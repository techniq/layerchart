import { allComponents } from 'content-collections';

interface ExampleInfo {
	component: string;
	section?: string;
	examples: Array<{
		name: string;
		path: string;
	}>;
}

export async function load() {
	const exampleModules = import.meta.glob('/src/examples/**/*.svelte');

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

		componentMap.get(componentName)!.push({
			name: exampleName,
			path: `/example/${componentName}/${exampleName}`
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
