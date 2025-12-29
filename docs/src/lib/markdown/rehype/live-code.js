import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { visit } from 'unist-util-visit';

const BASE_PATH = resolve(process.cwd(), '.live-code');
const LIVE_CODE_MAP = resolve(BASE_PATH, 'live-code-map.json');

/**
 * Remark plugin to handle live code blocks (e.g., ```svelte live)
 * Writes live code to .svelte files and imports them
 * MUST run BEFORE any rehype plugins (operates on markdown AST, not HTML)
 * @returns {(tree: import('mdast').Root, vFile: import('vfile').VFile) => void}
 */
export function remarkLiveCode() {
	// Ensure directory exists
	if (!existsSync(BASE_PATH)) {
		mkdirSync(BASE_PATH, { recursive: true });
	}

	// Initialize or load the map file
	if (!existsSync(LIVE_CODE_MAP)) {
		writeFileSync(LIVE_CODE_MAP, '{}');
	}

	return (tree, vFile) => {
		const liveCodeImports = new Map(); // Use Map to dedupe identical code blocks
		let hasScript = false;

		visit(tree, 'code', (node, index, parent) => {
			if (index === null || !parent) return;
			const { meta, lang, value } = node;
			const metaArray = (meta || '').split(' ').filter(Boolean);

			// Check if this is a live code block
			if (lang !== 'svelte' || !metaArray.includes('live')) return;

			// Use the raw code value
			const rawCode = value || '';

			// Generate unique ID for this code block based on file path and content hash
			const contentHash = createHash('md5').update(rawCode).digest('hex').substring(0, 8);
			const blockId = `${vFile.path}-${contentHash}`;
			const idMap = JSON.parse(readFileSync(LIVE_CODE_MAP, 'utf-8'));

			let componentFileName = idMap[blockId];
			if (!componentFileName) {
				// Generate unique filename
				const hash = Math.random().toString(36).substring(2, 11);
				componentFileName = `LiveCode${hash}.svelte`;
				idMap[blockId] = componentFileName;
				writeFileSync(LIVE_CODE_MAP, JSON.stringify(idMap, null, 2));
			}

			// Write the live code to a .svelte file
			const componentPath = resolve(BASE_PATH, componentFileName);
			writeFileSync(componentPath, rawCode);

			// Generate component name (remove .svelte extension)
			const componentName = componentFileName.replace(/\.svelte$/, '');

			// Track import for later injection (Map dedupes identical code blocks)
			liveCodeImports.set(componentName, `/.live-code/${componentFileName}`);

			// Create the live code container structure wrapped in LiveCodeWrapper
			const liveCodeContainer = {
				type: 'paragraph',
				data: {
					hName: 'div',
					hProperties: {}
				},
				children: [
					{
						type: 'html',
						value: `<LiveCode>{#snippet preview()}<${componentName} />{/snippet}<div class="live-code-source">`
					}
				]
			};

			// Add code section with original code block (title will be handled by rehype-code-block-title)
			liveCodeContainer.children.push(node);

			liveCodeContainer.children.push({
				type: 'html',
				value: '</div></LiveCode>' // Close live-code-source and LiveCode
			});

			// Replace the code node with the container
			parent.children[index] = liveCodeContainer;
		});

		// Inject imports at the beginning of the file
		if (liveCodeImports.size > 0) {
			const importStatements = [
				"import LiveCode from '$lib/markdown/components/LiveCode.svelte';",
				...[...liveCodeImports.entries()].map(
					([componentName, path]) => `import ${componentName} from '${path}';`
				)
			].join('\n');

			// Find existing script tag or create new one
			visit(tree, 'html', (node, idx, parent) => {
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
