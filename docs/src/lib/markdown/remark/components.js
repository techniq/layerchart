import { cls } from '@layerstack/tailwind';
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
 * - ::tab / :::tab - renders as Tab component (used inside tabs, supports icon attribute via unplugin-icons)
 * - :icon - renders as unplugin-icons component (inline icon with name attribute)
 * - :button - renders as Button component (inline button, supports icon attribute via unplugin-icons)
 * - :example - renders as Example component (inline example)
 *
 * @returns {(tree: any) => void} A remark transformer function
 */
/**
 * Convert icon name from various formats to unplugin-icons import format
 * @param {string} name - Icon name (e.g., "logos:tailwindcss-icon", "i-logos-tailwindcss-icon", "lucide:code")
 * @returns {{importPath: string, componentName: string}} - Import path and PascalCase component name
 */
function convertIconName(name) {
	// Remove i- prefix if present
	let iconName = name;
	if (iconName.startsWith('i-')) {
		iconName = iconName.slice(2);
	}

	// Split by colon to get collection and icon name
	let collection, icon;
	if (iconName.includes(':')) {
		[collection, icon] = iconName.split(':');
	} else {
		// For i-collection-icon format without colon, we need to parse differently
		// This is tricky because collections can have hyphens (e.g., vscode-icons)
		// For now, assume everything after first hyphen is the icon name
		const parts = iconName.split('-');
		collection = parts[0];
		icon = parts.slice(1).join('-');
	}

	// Create PascalCase component name by converting both collection and icon parts
	/** @param {string} str */
	const toPascalCase = (str) =>
		str
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join('');

	const componentName = toPascalCase(collection) + toPascalCase(icon);
	const importPath = `~icons/${collection}/${icon}`;

	return { importPath, componentName };
}

export function remarkComponents() {
	return (tree) => {
		const componentsToImport = new Set();
		const iconImports = new Map(); // Map of componentName -> importPath

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

				// Handle icon attribute on tab components (e.g., ::tab{label="pnpm" icon="vscode-icons:file-type-pnpm"})
				let processedAttributes = { ...attributes };
				if (componentName === 'tab' && attributes.icon) {
					const { importPath, componentName: iconCompName } = convertIconName(attributes.icon);
					iconImports.set(iconCompName, importPath);

					// Replace icon string with component reference expression
					// Remove quotes so it becomes {ComponentName} instead of "ComponentName"
					processedAttributes = {
						...attributes,
						icon: `{${iconCompName}}`
					};
				}

				// Convert the MDC component into a component that rehype can handle
				// We set data.hName to tell rehype to convert this to the component
				const data = node.data || (node.data = {});
				data.hName = svelteComponent;
				data.hProperties = {
					...processedAttributes,
					// Pass variant for alert components
					...(variant && { variant })
				};
			}

			// Handle inline text components (:component)
			if (node.type === 'textComponent') {
				const componentName = node.name;

				// Support :icon{name="logos:tailwindcss-icon"} or :icon{name="i-lucide-code"} syntax
				if (componentName === 'icon') {
					const iconName = node.attributes?.name;
					if (iconName) {
						const { importPath, componentName: iconComponentName } = convertIconName(iconName);

						// Track this icon import
						iconImports.set(iconComponentName, importPath);

						// Get other attributes (excluding 'name')
						const { name: _, class: className, ...otherAttributes } = node.attributes || {};

						// Convert to the icon component
						const data = node.data || (node.data = {});
						data.hName = iconComponentName;
						data.hProperties = {
							...otherAttributes,
							class: cls('inline-block', className)
						};
					}
				} else if (componentName === 'button') {
					componentsToImport.add('Button');

					const attributes = node.attributes || {};

					// Handle icon attribute on button components (e.g., :button{icon="lucide:github"})
					let processedAttributes = { ...attributes };
					if (attributes.icon) {
						const { importPath, componentName: iconCompName } = convertIconName(attributes.icon);
						iconImports.set(iconCompName, importPath);

						// Replace icon string with component reference expression
						processedAttributes = {
							...attributes,
							icon: `{${iconCompName}}`
						};
					}

					const data = node.data || (node.data = {});
					data.hName = 'Button';
					data.hProperties = processedAttributes;
				} else if (componentName === 'example') {
					componentsToImport.add('Example');

					const data = node.data || (node.data = {});
					data.hName = 'Example';
					data.hProperties = {
						...(node.attributes || {})
					};
				}
			}
		});

		// Inject component imports at the beginning of the file
		if (componentsToImport.size > 0 || iconImports.size > 0) {
			// Generate regular component imports
			const componentArray = Array.from(componentsToImport);
			const componentImportStatements = componentArray
				.map((comp) => {
					// Example component lives in $lib/components, not $lib/markdown/components
					const path = comp === 'Example' ? '$lib/components' : '$lib/markdown/components';
					return `import ${comp} from '${path}/${comp}.svelte';`;
				})
				.join('\n');

			// Generate icon imports from unplugin-icons
			const iconImportStatements = Array.from(iconImports.entries())
				.map(([componentName, importPath]) => {
					return `import ${componentName} from '${importPath}';`;
				})
				.join('\n');

			// Combine all imports
			const importStatements = [componentImportStatements, iconImportStatements]
				.filter(Boolean)
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
