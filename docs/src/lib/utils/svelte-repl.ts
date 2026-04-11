interface File {
	name: string;
	source: string;
}

// Lazy-load $lib source files for REPL import resolution (loaded on demand, not eagerly)
const libModules = import.meta.glob(['/src/lib/**/*.{ts,js,svelte}'], {
	query: '?raw',
	import: 'default'
}) as Record<string, () => Promise<string>>;

async function readFile(path: string): Promise<string> {
	const key = `/${path}`;
	const loader = libModules[key];
	if (!loader) throw new Error(`File not found: ${path}`);
	return loader();
}

/**
 * Parse local imports from a source file, resolve them using the readFile function,
 * and return an array of files ready for the Svelte playground (with App.svelte as entry point).
 */
export async function accumulateReplFiles(source: string): Promise<File[]> {
	// Parse relative, $lib, and absolute path imports
	const importPattern =
		/import\s+(?:\{[^}]+\}|\w+)\s+from\s+['"]((?:\.|\.\.|\$lib|\/)\/[^'"]+)['"]/g;
	const localImports: { importPath: string; fileName: string; resolvedPath: string }[] = [];
	let match;
	while ((match = importPattern.exec(source)) !== null) {
		const importPath = match[1];
		const fileName = importPath.split('/').pop() ?? importPath;

		let resolvedPath: string;
		if (importPath.startsWith('$lib/')) {
			resolvedPath = `src/lib/${importPath.slice('$lib/'.length)}`;
		} else {
			resolvedPath = `src/routes/${importPath.replace(/^\.\//, '')}`;
		}

		localImports.push({ importPath, fileName, resolvedPath });
	}

	const files: File[] = [];
	let rewrittenMain = source;

	for (const { importPath, fileName, resolvedPath } of localImports) {
		// First pass: rewrite import to flat filename
		rewrittenMain = rewrittenMain.replace(
			new RegExp(`from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`),
			`from './${fileName}'`
		);

		let actualPath = resolvedPath;
		try {
			let fileSource: string;
			try {
				fileSource = await readFile(resolvedPath);
			} catch {
				const hasExtension = /\.\w+$/.test(resolvedPath);
				if (hasExtension && resolvedPath.endsWith('.js')) {
					actualPath = resolvedPath.replace(/\.js$/, '.ts');
					fileSource = await readFile(actualPath);
				} else if (!hasExtension) {
					// Try common extensions for extensionless imports
					let resolved: string | undefined;
					for (const ext of ['.ts', '.js', '.svelte']) {
						try {
							actualPath = resolvedPath + ext;
							fileSource = await readFile(actualPath);
							break;
						} catch {
							/* try next extension */
						}
					}
					if (!fileSource!) throw new Error(`File not found: ${resolvedPath}`);
				} else {
					throw new Error(`File not found: ${resolvedPath}`);
				}
			}
			const actualFileName = actualPath.split('/').pop() ?? actualPath;
			files.push({ name: actualFileName, source: fileSource });

			// Rewrite import to use actual filename if extension changed
			if (actualFileName !== fileName) {
				rewrittenMain = rewrittenMain.replace(`from './${fileName}'`, `from './${actualFileName}'`);
			}
		} catch {
			console.warn(`Could not read import: ${resolvedPath}`);
		}
	}

	// App.svelte must be first (it's the entry point)
	files.unshift({ name: 'App.svelte', source: rewrittenMain });

	return files;
}

export async function openInSvelteREPL(source: string) {
	const files = await accumulateReplFiles(source);
	const url = await createSvelteReplUrl(files);
	window.open(url, '_blank');
}

export async function createSvelteReplUrl(files: File[]) {
	const useTailWind = false;
	// Temporary: use layerchart@next until layerchart is published as latest
	const useNext = true;

	const playgroundFiles = files.map((f) => {
		let contents = f.source;
		if (f.name === 'App.svelte') {
			if (useNext) {
				contents = contents.replace(/from\s+['"]layerchart['"]/g, "from 'layerchart@next'");
			}

			// Add theme CSS
			let themeCSS = `
	:global(.lc-root-container) {
		color-scheme: light;
		--color-primary: hsl(217, 91%, 60%);
		--color-primary-content: hsl(0, 0%, 100%);
		--color-secondary: hsl(25, 95%, 53%);
		--color-surface-100: hsl(0, 0%, 100%);
		--color-surface-200: hsl(220, 14%, 96%);
		--color-surface-300: hsl(216, 12%, 84%);
		--color-surface-content: hsl(221, 39%, 11%);
	}
	@media (prefers-color-scheme: dark) {
		:global(.lc-root-container) {
			color-scheme: dark;
			--color-primary: hsl(217, 91%, 60%);
			--color-primary-content: hsl(0, 0%, 100%);
			--color-secondary: hsl(25, 95%, 53%);
			--color-surface-100: hsl(240, 4%, 16%);
			--color-surface-200: hsl(240, 6%, 10%);
			--color-surface-300: hsl(240, 10%, 4%);
			--color-surface-content: hsl(240, 5%, 96%);
		}
	}
`;
			if (
				[
					'--color-apples',
					'--color-bananas',
					'--color-cherries',
					'--color-grapes',
					'--color-oranges'
				].some((token) => contents.includes(token))
			) {
				themeCSS += `	:global(.lc-root-container) {
		--color-apples: hsl(142, 71%, 45%);
		--color-bananas: hsl(48, 96%, 53%);
		--color-cherries: hsl(0, 84%, 60%);
		--color-grapes: hsl(271, 91%, 65%);
		--color-oranges: hsl(25, 95%, 53%);
	}
`;
			}

			if (contents.includes('</style>')) {
				// Inject into existing style block
				contents = contents.replace('</style>', `${themeCSS}</style>`);
			} else {
				contents += `\n<style>${themeCSS}</style>`;
			}
			contents = contents.trim();
		}

		return {
			type: 'file',
			name: f.name,
			basename: f.name,
			contents,
			text: true
		};
	});
	const data = { tailwind: useTailWind, files: playgroundFiles };
	const json = JSON.stringify(data);

	// Convert string to Uint8Array
	const encoder = new TextEncoder();
	const uint8Array = encoder.encode(json);

	// Compress using CompressionStream (modern browsers)
	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue(uint8Array);
			controller.close();
		}
	});

	const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));

	// Read the compressed data
	const reader = compressedStream.getReader();
	const chunks = [];

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
	}

	// Combine chunks into single Uint8Array
	const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
	let offset = 0;
	for (const chunk of chunks) {
		compressed.set(chunk, offset);
		offset += chunk.length;
	}

	// Base64 encode (URL-safe)
	const base64 = btoa(String.fromCharCode(...compressed))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	return `https://svelte.dev/playground#${base64}`;
}
