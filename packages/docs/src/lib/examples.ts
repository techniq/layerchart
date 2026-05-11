import type { Component } from 'svelte';

export type LoadedExample = {
	component: Component;
	source: string;
	module?: {
		title?: string;
		description?: string;
		layers?: string[];
	};
};

export type Examples = Record<string, Record<string, LoadedExample>>;

export type ExampleType = 'components' | 'utils';

export type ComponentExampleImporter = (
	type: ExampleType,
	component: string,
	name: string
) => Promise<{ default: Component; title?: string; description?: string; layers?: string[] }>;

export type RawExampleImporter = (
	type: ExampleType,
	component: string,
	name: string
) => Promise<string>;

export type PathExampleImporter = (path: string) => Promise<{ default: Component } | undefined>;

export type RawPathExampleImporter = (path: string) => Promise<string | undefined>;

export function cleanExampleSource(source: string): string {
	return source
		.replace(/<script\s+module>[\s\S]*?<\/script>\n*/g, '')
		.replace(/(\n\s*)*^.*export .*;.*$(\n\s*)*/gm, '\n');
}

export function cleanPathExampleSource(source: string): string {
	return source.replace(/(\n\s*)*^.*export .*;.*$(\n\s*)*/gm, '\n');
}

export function createExampleLoaders(options: {
	loadComponentExample: ComponentExampleImporter;
	loadRawExample: RawExampleImporter;
	loadPathExample: PathExampleImporter;
	loadRawPathExample: RawPathExampleImporter;
	warn?: typeof console.warn;
}) {
	const warn = options.warn ?? console.warn;

	async function loadExample(
		component: string,
		name: string,
		type: ExampleType = 'components'
	): Promise<LoadedExample | null> {
		try {
			const [componentModule, rawSource] = await Promise.all([
				options.loadComponentExample(type, component, name),
				options.loadRawExample(type, component, name)
			]);

			const { default: comp, ...module } = componentModule;
			return {
				component: comp,
				source: cleanExampleSource(rawSource),
				module
			};
		} catch (e) {
			warn(`Failed to load example: ${type}/${component}/${name}`, e);
			return null;
		}
	}

	async function loadExamples(
		items: Array<{ component: string; name: string }>,
		type: ExampleType = 'components'
	): Promise<Examples> {
		const results: Examples = {};

		await Promise.all(
			items.map(async ({ component, name }) => {
				const example = await loadExample(component, name, type);
				if (example) {
					if (!results[component]) {
						results[component] = {};
					}
					results[component][name] = example;
				}
			})
		);

		return results;
	}

	async function loadExampleByPath(resolvedPath: string): Promise<LoadedExample | null> {
		try {
			const [componentModule, rawSource] = await Promise.all([
				options.loadPathExample(resolvedPath),
				options.loadRawPathExample(resolvedPath)
			]);

			if (!componentModule || rawSource === undefined) {
				warn(`Failed to load example by path: ${resolvedPath}`);
				return null;
			}

			return {
				component: componentModule.default,
				source: cleanPathExampleSource(rawSource)
			};
		} catch (e) {
			warn(`Failed to load example by path: ${resolvedPath}`, e);
			return null;
		}
	}

	return { loadExample, loadExamples, loadExampleByPath };
}
