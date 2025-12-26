import { visit } from 'unist-util-visit';

/**
 * Remark plugin to transform directives (:::tip, :::note, :::steps, etc.) into custom components
 * Works with remark-directive to convert container directives into Svelte components
 *
 * Supported directives:
 * - :::tip - renders as Note component with variant="tip"
 * - :::note - renders as Note component with variant="note"
 * - :::warning - renders as Note component with variant="warning"
 * - :::caution - renders as Note component with variant="caution"
 * - :::steps - renders as Steps component
 *
 * @returns {(tree: any) => void} A remark transformer function
 */
export function remarkDirectives() {
	return (tree) => {
		const componentsToImport = new Set();

		visit(tree, (node) => {
			// Handle container directives (:::directive)
			if (node.type === 'containerDirective') {
				const directiveName = node.name;

				// Alert variants all use the Note component
				const alertVariants = ['tip', 'note', 'warning', 'caution'];

				// Map directive names to component names and variants
				let componentName;
				let variant;

				if (alertVariants.includes(directiveName)) {
					componentName = 'Note';
					variant = directiveName;
				} else if (directiveName === 'steps') {
					componentName = 'Steps';
				} else {
					// Unknown directive, skip
					return;
				}

				// Track which components we need to import
				componentsToImport.add(componentName);

				// Get directive attributes
				const attributes = node.attributes || {};

				// Convert the directive into a custom component in the HTML tree
				// We set data.hName to tell rehype to convert this to the component
				const data = node.data || (node.data = {});
				data.hName = componentName;
				data.hProperties = {
					...attributes,
					// Pass variant for alert components
					...(variant && { variant }),
					// Pass any directive label as a prop
					...(node.attributes?.label && { label: node.attributes.label })
				};
			}

			// Handle text directives (:directive[text]) if needed
			if (node.type === 'textDirective') {
				// Can be used for inline directives if needed in the future
			}

			// Handle leaf directives (::directive) if needed
			if (node.type === 'leafDirective') {
				// Can be used for self-closing directives if needed in the future
			}
		});

		// Inject component imports at the beginning of the file
		if (componentsToImport.size > 0) {
			const componentArray = Array.from(componentsToImport);
			const importStatements = componentArray
				.map((comp) => `import ${comp} from '$lib/markdown/components/${comp}.svelte';`)
				.join('\n');

			// Check if there's already a script tag
			let hasScript = false;
			visit(tree, 'html', (node) => {
				if (node.value.startsWith('<script') && !hasScript) {
					hasScript = true;
					node.value = node.value.replace(
						/<script[^>]*>/,
						(match) => `${match}\n${importStatements}`
					);
					return visit.EXIT;
				}
			});

			if (!hasScript) {
				// Create new script tag at the beginning
				tree.children.unshift({
					type: 'html',
					value: `<script>\n${importStatements}\n</script>`
				});
			}
		}
	};
}
