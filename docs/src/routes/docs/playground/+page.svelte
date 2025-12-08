<script lang="ts" module>
	import { WebContainer } from '@webcontainer/api';

	// Singleton instance stored outside component lifecycle
	let webcontainerPromise: Promise<WebContainer> | null = null;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import CodeEditor from './CodeEditor.svelte';
	import { Overlay, ProgressCircle } from 'svelte-ux';

	let { data }: { data: PageData } = $props();

	let iframeEl = $state<HTMLIFrameElement | null>(null);
	let webcontainerInstance = $state<WebContainer | null>(null);

	// File editing state
	let selectedFile = $state<string>('src/routes/+page.svelte');
	let fileContent = $state<string>('');
	let editableFiles = $state<string[]>([]);
	let isLoadingFile = $state(false);

	// Loading state
	let loadingStatus = $state<string | null>('Initializing WebContainer...');
	let isReady = $state(false);
	let viteConnected = $state(false);
	let viteTimeoutId: number | null = null;

	async function getWebContainerInstance() {
		if (!webcontainerPromise) {
			webcontainerPromise = WebContainer.boot();
		}
		return webcontainerPromise;
	}

	// Get list of editable files from the template
	function getEditableFiles(): string[] {
		const files: string[] = [];
		function traverse(obj: any, prefix = '') {
			for (const [key, value] of Object.entries(obj)) {
				if (value && typeof value === 'object') {
					if ('file' in value) {
						files.push(prefix + key);
					} else if ('directory' in value) {
						traverse(value.directory, prefix + key + '/');
					}
				}
			}
		}
		traverse(data.templateProjectFiles);
		return files.filter(
			(f) => f.endsWith('.svelte') || f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.css')
		);
	}

	// Load file content
	async function loadFileContent(filepath: string) {
		if (!webcontainerInstance) return;

		isLoadingFile = true;
		try {
			const content = await webcontainerInstance.fs.readFile(filepath, 'utf-8');
			fileContent = content;
		} catch (err) {
			console.error('Failed to read file:', err);
			fileContent = '// Error loading file';
		} finally {
			isLoadingFile = false;
		}
	}

	// Save file content
	async function saveFileContent() {
		if (!webcontainerInstance || !selectedFile) return;

		try {
			await webcontainerInstance.fs.writeFile(selectedFile, fileContent);
		} catch (err) {
			console.error('Failed to save file:', err);
		}
	}

	// Handle file selection change
	async function handleFileSelect(filepath: string) {
		selectedFile = filepath;
		await loadFileContent(filepath);
	}

	onMount(async () => {
		try {
			loadingStatus = 'Booting WebContainer...';
			webcontainerInstance = await getWebContainerInstance();

			if (!webcontainerInstance) {
				throw new Error('Failed to boot WebContainer');
			}

			loadingStatus = 'Mounting project files...';
			await webcontainerInstance.mount(data.templateProjectFiles);

			// Get editable files list
			editableFiles = getEditableFiles();

			loadingStatus = 'Loading editor...';
			await loadFileContent(selectedFile);

			// Listen for messages from the iframe to detect Vite connection
			const handleMessage = (event: MessageEvent) => {
				// Only process messages from our iframe
				if (event.source !== iframeEl?.contentWindow) return;

				// Check if message is from Vite client
				if (event.data && typeof event.data === 'object') {
					const data = event.data;
					// Vite HMR sends various message types - we'll clear loading on any HMR activity
					if (data.type && (data.type.includes('vite') || data.type === 'connected')) {
						if (!viteConnected) {
							viteConnected = true;
							if (viteTimeoutId) {
								clearTimeout(viteTimeoutId);
								viteTimeoutId = null;
							}
							loadingStatus = null;
							isReady = true;
						}
					}
				}
			};

			window.addEventListener('message', handleMessage);

			webcontainerInstance.on('server-ready', (port, url) => {
				if (iframeEl) {
					loadingStatus = 'Loading preview...';
					iframeEl.src = url;
				}
			});

			await startDevServer();
		} catch (error) {
			loadingStatus = 'Error: ' + (error instanceof Error ? error.message : 'Unknown error');
		}
	});

	async function startDevServer() {
		if (!webcontainerInstance) {
			throw new Error('WebContainer instance not initialized');
		}

		// Install dependencies
		loadingStatus = 'Installing dependencies...';
		const installProcess = await webcontainerInstance.spawn('npm', ['install']);
		const installExitCode = await installProcess.exit;

		if (installExitCode !== 0) {
			throw new Error('Unable to run npm install');
		}

		// Start dev server
		loadingStatus = 'Starting dev server...';
		const devProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']);

		// Listen to output to detect when Vite is building
		devProcess.output.pipeTo(
			new WritableStream({
				write(data) {
					const text = data.toString();
					console.log('[WebContainer]:', text);

					// Update status based on Vite output
					if (text.includes('VITE') && text.includes('ready')) {
						loadingStatus = 'Ready! Loading preview...';
					} else if (text.includes('build started') || text.includes('building')) {
						loadingStatus = 'Building application...';
					}
				}
			})
		);
	}
</script>

<div class="h-screen -mx-6 -my-4 lg:-mx-20 lg:-my-8 flex bg-surface-100">
	<!-- Editor Panel -->
	<div class="w-1/2 flex flex-col border-r border-surface-content/10">
		<!-- File Selector -->
		<div class="p-2 border-b border-surface-content/10 bg-surface-100">
			<select
				bind:value={selectedFile}
				onchange={() => handleFileSelect(selectedFile)}
				class="w-full px-3 py-2 rounded border border-surface-content/20 bg-surface text-sm font-mono"
			>
				{#each editableFiles as file}
					<option value={file}>{file}</option>
				{/each}
			</select>
		</div>

		<!-- Code Editor -->
		<div class="flex-1 overflow-hidden">
			{#if isLoadingFile}
				<div class="flex items-center justify-center h-full">
					<div class="text-surface-content/50">Loading...</div>
				</div>
			{:else}
				<CodeEditor bind:value={fileContent} filename={selectedFile} oninput={saveFileContent} />
			{/if}
		</div>
	</div>

	<!-- Preview Panel -->
	<div class="relative w-1/2 bg-surface-100">
		{#if loadingStatus}
			<Overlay class="flex flex-col gap-4 bg-surface-100/50" center>
				<ProgressCircle width={2} />
				<div class="text-lg font-medium">{loadingStatus}</div>
			</Overlay>
		{/if}
		<iframe
			bind:this={iframeEl}
			title="LayerChart Playground"
			class="w-full h-full border-none"
			allowfullscreen
			onload={() => {
				// Wait for Vite to connect before clearing loading status
				if (iframeEl?.src && !viteConnected) {
					loadingStatus = 'Connecting to Vite...';
					// Fallback: clear after 3 seconds if Vite doesn't connect
					viteTimeoutId = window.setTimeout(() => {
						if (loadingStatus === 'Connecting to Vite...') {
							loadingStatus = null;
							isReady = true;
							viteConnected = true;
						}
					}, 3000);
				} else if (viteConnected) {
					loadingStatus = null;
					isReady = true;
				}
			}}
		></iframe>
	</div>
</div>
