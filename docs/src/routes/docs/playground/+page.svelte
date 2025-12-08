<script lang="ts" module>
	import { WebContainer } from '@webcontainer/api';

	// Singleton instance stored outside component lifecycle
	let webcontainerPromise: Promise<WebContainer> | null = null;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let iframeEl = $state<HTMLIFrameElement | null>(null);
	let webcontainerInstance = $state<WebContainer | null>(null);

	// File editing state
	let selectedFile = $state<string>('src/routes/+page.svelte');
	let fileContent = $state<string>('');
	let editableFiles = $state<string[]>([]);
	let isLoadingFile = $state(false);

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
		return files.filter(f =>
			f.endsWith('.svelte') ||
			f.endsWith('.ts') ||
			f.endsWith('.js') ||
			f.endsWith('.css')
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
		webcontainerInstance = await getWebContainerInstance();

		if (!webcontainerInstance) {
			throw new Error('Failed to boot WebContainer');
		}
		await webcontainerInstance.mount(data.templateProjectFiles);

		// Get editable files list
		editableFiles = getEditableFiles();

		// Load initial file
		await loadFileContent(selectedFile);

		webcontainerInstance.on('server-ready', (port, url) => {
			if (iframeEl) {
				iframeEl.src = url;
			}
		});

		await startDevServer();
	});

	async function startDevServer() {
		if (!webcontainerInstance) {
			throw new Error('WebContainer instance not initialized');
		}

		// Install dependencies
		const installProcess = await webcontainerInstance.spawn('npm', ['install']);
		const installExitCode = await installProcess.exit;

		if (installExitCode !== 0) {
			throw new Error('Unable to run npm install');
		}

		// Start dev server
		await webcontainerInstance.spawn('npm', ['run', 'dev']);
	}
</script>

<div class="h-screen -mx-6 -my-4 lg:-mx-20 lg:-my-8 flex">
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
				<textarea
					bind:value={fileContent}
					oninput={saveFileContent}
					class="w-full h-full p-4 font-mono text-sm bg-surface resize-none focus:outline-none"
					spellcheck="false"
				></textarea>
			{/if}
		</div>
	</div>

	<!-- Preview Panel -->
	<div class="w-1/2">
		<iframe
			bind:this={iframeEl}
			title="LayerChart Playground"
			class="w-full h-full border-none"
			allowfullscreen
		></iframe>
	</div>
</div>
