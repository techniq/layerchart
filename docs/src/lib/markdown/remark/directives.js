import { visit, EXIT } from 'unist-util-visit';

/**
 * Remark plugin to transform MDC components (::tip, ::note, ::steps, etc.) into custom Svelte components
 * Works with remark-mdc to convert MDC components into Svelte components
 *
 * Supported components:
 * - ::tip / :::tip - renders as Note component with variant="tip"
 * - ::note / :::note - renders as Note component with variant="note"
 * - ::warning / :::warning - renders as Note component with variant="warning"
 * - ::caution / :::caution - renders as Note component with variant="caution"
 * - ::steps / :::steps - renders as Steps component
 * - ::tabs / :::tabs - renders as Tabs component (supports nested ::tab)
 * - ::tab / :::tab - renders as Tab component (used inside tabs, supports icon attribute)
 * - :icon - renders as Icon component (inline icon with name attribute)
 *
 * @returns {(tree: any) => void} A remark transformer function
 */
export function remarkDirectives() {
	return (tree) => {
		const componentsToImport = new Set();

		// Process MDC components (remark-mdc creates leafComponent and containerComponent nodes)
		visit(tree, (node) => {
			// Handle both leafComponent (::component) and containerComponent (::component...::)
			if (node.type === 'leafComponent' || node.type === 'containerComponent') {
				const componentName = node.name;

				// Alert variants all use the Note component
				const alertVariants = ['tip', 'note', 'warning', 'caution'];

				// Map component names to Svelte component names and variants
				let svelteComponent;
				let variant;

				if (alertVariants.includes(componentName)) {
					svelteComponent = 'Note';
					variant = componentName;
				} else if (componentName === 'steps') {
					svelteComponent = 'Steps';
				} else if (componentName === 'tabs') {
					svelteComponent = 'Tabs';
				} else if (componentName === 'tab') {
					svelteComponent = 'Tab';
				} else {
					// Unknown component, skip transformation
					return;
				}

				// Track which components we need to import
				componentsToImport.add(svelteComponent);

				// Get component attributes from MDC
				const attributes = node.attributes || {};

				// Convert the MDC component into a component that rehype can handle
				// We set data.hName to tell rehype to convert this to the component
				const data = node.data || (node.data = {});
				data.hName = svelteComponent;
				data.hProperties = {
					...attributes,
					// Pass variant for alert components
					...(variant && { variant })
				};
			}

			// Handle inline text components (:component)
			if (node.type === 'textComponent') {
				const componentName = node.name;

				// Support :icon{name="i-lucide-code"} syntax
				if (componentName === 'icon') {
					componentsToImport.add('Icon');

					const data = node.data || (node.data = {});
					data.hName = 'Icon';
					data.hProperties = {
						...(node.attributes || {})
					};
				}
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
						/** @param {string} match */
						(match) => `${match}\n${importStatements}`
					);
					return EXIT;
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
