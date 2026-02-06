<script lang="ts" module>
	import { WebContainer } from '@webcontainer/api';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import { Icon, Button, Tooltip } from 'svelte-ux';
	import { slide } from 'svelte/transition';
	import FileTree from './FileTree/FileTree.svelte';
	import SimpleIconsStackblitz from '~icons/simple-icons/stackblitz';
	import SimpleIconsTerminal from '~icons/simple-icons/windowsterminal';
	import SimpleIconsSvelte from '~icons/simple-icons/svelte';
	import VscodeIconsFileTypeSvelte from '~icons/vscode-icons/file-type-svelte';
	import VscodeIconsFileTypeTypescript from '~icons/vscode-icons/file-type-typescript';
	import VscodeIconsFileTypeJavascript from '~icons/vscode-icons/file-type-js';
	import VscodeIconsFileTypeCss from '~icons/vscode-icons/file-type-css';
	import RefreshCcwIcon from '~icons/lucide/refresh-ccw';
	import ChevronDown from '~icons/lucide/chevron-down';
	import ChevronUp from '~icons/lucide/chevron-up';
	import TrashIcon from '~icons/lucide/trash';
	import Download from '~icons/lucide/download';
	// Singleton instance stored in globalThis to persist across hot reloads
	const WEBCONTAINER_KEY = '__webcontainer_instance__';

	declare global {
		interface Window {
			[WEBCONTAINER_KEY]?: Promise<WebContainer>;
		}
	}
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { PageData } from './$types';
	import CodeEditor from './CodeEditor.svelte';
	import { Overlay, ProgressCircle } from 'svelte-ux';
	import { AnsiUp } from 'ansi_up';
	import { openInSvelteREPL } from '$lib/utils/svelte-repl';

	let { data }: { data: PageData } = $props();
	const ansiUp = new AnsiUp();

	// Container, Pane, and Elements state
	let webcontainerInstance = $state<WebContainer | null>(null);
	let iframeEl = $state<HTMLIFrameElement | null>(null);
	let fileSelectorEl = $state<HTMLDivElement | null>(null);
	let previewPaneGroup = $state<ReturnType<typeof PaneGroup>>(); // Preview and Console Pane Groups
	let consolePane = $state<ReturnType<typeof Pane>>();
	let consoleOutput = $state('Provisioning...\n\n');
	let consoleScrollContainer = $state<HTMLDivElement>();
	let isConsoleScrollAtBottom = $state(true);
	let fileTreeShowing = $state<boolean>(false);

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

	function isScrolledToBottom() {
		if (!consoleScrollContainer) return false;
		const threshold = 5; // pixels threshold to account for rounding
		return (
			consoleScrollContainer.scrollHeight - consoleScrollContainer.scrollTop <=
			consoleScrollContainer.clientHeight + threshold
		);
	}

	// Track scroll position changes to know if user has manually scrolled
	function handleConsoleScroll() {
		isConsoleScrollAtBottom = isScrolledToBottom();
	}

	async function scrollConsoleToBottom() {
		await tick();
		consoleScrollContainer?.scrollTo({
			top: consoleScrollContainer.scrollHeight,
			behavior: 'instant'
		});
	}

	// Auto-scroll console when output changes, only if we were at the bottom
	$effect(() => {
		if (consoleOutput && consolePane && !consolePane.isCollapsed() && isConsoleScrollAtBottom) {
			scrollConsoleToBottom();
		}
	});

	let fileIcon = $derived.by(() => {
		if (selectedFile.endsWith('.svelte')) {
			return VscodeIconsFileTypeSvelte;
		} else if (selectedFile.endsWith('.ts')) {
			return VscodeIconsFileTypeTypescript;
		} else if (selectedFile.endsWith('.js')) {
			return VscodeIconsFileTypeJavascript;
		} else if (selectedFile.endsWith('.css')) {
			return VscodeIconsFileTypeCss;
		}
	});

	async function getWebContainerInstance() {
		if (typeof window !== 'undefined') {
			if (!window[WEBCONTAINER_KEY]) {
				window[WEBCONTAINER_KEY] = WebContainer.boot();
			}
			return window[WEBCONTAINER_KEY];
		}
		throw new Error('WebContainer can only be initialized in browser');
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

	// Save selected file content
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

	// Save Project Locally
	async function saveProject() {
		// This needs wired up
	}

	// Open Project in StackBlitz
	async function openInStackBlitz() {
		// This needs wired up
	}

	// Open Project in REPL
	async function openInREPL() {
		if (!webcontainerInstance) return;

		try {
			const mainSource = await webcontainerInstance.fs.readFile('src/routes/+page.svelte', 'utf-8');
			await openInSvelteREPL(mainSource);
		} catch (err) {
			console.error('Failed to open in REPL:', err);
		}
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

			// Listen for messages from the iframe to detect Vite connection and console logs
			const handleMessage = (event: MessageEvent) => {
				// Only process messages from our iframe
				if (event.source !== iframeEl?.contentWindow) return;

				// Check if message is from Vite client
				if (event.data && typeof event.data === 'object') {
					const data = event.data;

					// Handle console logs from iframe
					if (data.type === 'console') {
						const logType = data.level || 'log';
						const args = data.args || [];
						const logText = args
							.map((arg: any) => {
								if (typeof arg === 'object') {
									return JSON.stringify(arg, null, 2);
								}
								return String(arg);
							})
							.join(' ');

						const colorMap: Record<string, string> = {
							log: '#e5e7eb',
							warn: '#fbbf24',
							error: '#ef4444',
							info: '#3b82f6'
						};
						const color = colorMap[logType] || colorMap.log;

						consoleOutput += `<span style="color: ${color}">[${logType}] ${logText}</span>\n`;
					}

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
		const installProcess = await webcontainerInstance.spawn('pnpm', ['install']);

		// Capture install output
		installProcess.output.pipeTo(
			new WritableStream({
				write(data) {
					const text = data.toString();
					console.log('[WebContainer install]:', text);
					consoleOutput += ansiUp.ansi_to_html(text);
				}
			})
		);

		const installExitCode = await installProcess.exit;

		if (installExitCode !== 0) {
			throw new Error('Unable to run pnpm install');
		}

		// Start dev server
		loadingStatus = 'Starting dev server...';
		const devProcess = await webcontainerInstance.spawn('pnpm', ['run', 'dev']);

		// Listen to output to detect when Vite is building
		devProcess.output.pipeTo(
			new WritableStream({
				write(data) {
					const text = data.toString();

					// Skip large amount of blank lines
					if (
						text ===
						'\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n'
					) {
						return;
					}

					console.log('[WebContainer]:', text);

					// Append to console output (converting ANSI codes to HTML)
					consoleOutput += ansiUp.ansi_to_html(text);

					// Update status based on Vite output
					if (text.includes('VITE') && text.includes('ready')) {
						loadingStatus = 'Ready! Loading preview...';
						// TODO: Consider reeanbling auto-hiding once the timing is better
						// consolePane?.collapse();
					} else if (text.includes('build started') || text.includes('building')) {
						loadingStatus = 'Building application...';
					}
				}
			})
		);
	}

	function toggleConsole() {
		if (consolePane?.isCollapsed()) {
			consolePane.expand();
		} else {
			consolePane?.collapse();
		}
	}

	// Handle click outside of file tree to close it
	// Save current +page.svelte to local filesystem via system save dialog
	async function saveNewExample() {
		if (!webcontainerInstance) return;

		try {
			const content = await webcontainerInstance.fs.readFile(
				'src/routes/+page.svelte',
				'utf-8'
			);

			const handle = await window.showSaveFilePicker({
				suggestedName: '+page.svelte',
				types: [
					{
						description: 'Svelte files',
						accept: { 'text/plain': ['.svelte'] }
					}
				]
			});

			const writable = await handle.createWritable();
			await writable.write(content);
			await writable.close();
		} catch (err: any) {
			// User cancelled the dialog
			if (err.name === 'AbortError') return;
			console.error('Failed to save example:', err);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.metaKey && event.shiftKey && event.key === 's') {
			event.preventDefault();
			saveNewExample();
		}
	}

	function handleClickOutside(event: MouseEvent) {
		// Don't close if clicking on SVG icons (folder toggles)
		const target = event.target as Element;
		if (target instanceof SVGElement) return;

		if (fileTreeShowing && fileSelectorEl && !fileSelectorEl.contains(event.target as Node)) {
			fileTreeShowing = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div class="h-[calc(100vh-64px)] flex bg-surface-100">
	<!-- Editor Panel -->
	<PaneGroup direction="horizontal">
		<Pane defaultSize={50} minSize={5}>
			<div class="flex flex-col h-full border-r border-surface-content/10">
				<div
					class="relative flex items-center gap-4 p-2 border-b border-surface-content/10 bg-transparent"
				>
					<!-- File Selector -->
					<div bind:this={fileSelectorEl} class="flex-1">
						{#if fileTreeShowing}
							<div
								transition:slide={{ duration: 200 }}
								class="absolute left-0 right-0 top-full z-10 bg-surface-100 border-t border-surface-content/10 shadow-lg"
							>
								<FileTree
									class="w-full py-2 pl-4 pr-2 bg-surface-100 overlow-x-clip overflow-y-auto"
									filePaths={editableFiles}
									{selectedFile}
									onSelect={(path: any) => {
										handleFileSelect(path);
										fileTreeShowing = false;
									}}
								/>
							</div>
						{/if}
						<Button
							class="border py-1 px-2 w-full justify-between bg-surface-100"
							on:click={() => (fileTreeShowing = !fileTreeShowing)}
						>
							<span class="flex items-center gap-2 flex-1 text-left">
								<Icon data={fileIcon} />
								{selectedFile}
							</span>
							{#key fileTreeShowing}
								<Icon
									data={fileTreeShowing ? ChevronUp : ChevronDown}
									class="text-surface-content/50"
								/>
							{/key}</Button
						>
					</div>
					<Tooltip title="Open in StackBlitz" placement="top" offset={6}>
						<Button
							icon={SimpleIconsStackblitz}
							size="sm"
							variant="fill-light"
							onclick={openInStackBlitz}
						/>
					</Tooltip>
					<Tooltip title="Open in REPL" placement="top" offset={6}>
						<Button icon={SimpleIconsSvelte} size="sm" variant="fill-light" onclick={openInREPL} />
					</Tooltip>
					<Tooltip title="Download" placement="top" offset={6}>
						<Button
							icon={Download}
							size="sm"
							variant="fill-light"
							target="_blank"
							onclick={saveProject}
						/>
					</Tooltip>
				</div>

				<!-- Code Editor -->
				<div class="flex-1 overflow-hidden">
					{#if isLoadingFile}
						<div class="flex items-center justify-center h-full">
							<div class="text-surface-content/50">Loading...</div>
						</div>
					{:else}
						<CodeEditor
							bind:value={fileContent}
							filename={selectedFile}
							oninput={saveFileContent}
						/>
					{/if}
				</div>
			</div>
		</Pane>

		<PaneResizer class="w-0.5 bg-surface-content/10" />

		<!-- Preview Panel -->
		<Pane defaultSize={50} minSize={5}>
			<PaneGroup direction="vertical" bind:this={previewPaneGroup}>
				<Pane defaultSize={70}>
					<div class="relative h-full bg-surface-100 pt-[47px]">
						{#if loadingStatus}
							<Overlay class="flex flex-col gap-4 bg-surface-100/50" center>
								<ProgressCircle width={2} />
								<div class="text-lg font-medium">{loadingStatus}</div>
							</Overlay>
						{:else}
							<button
								class="absolute top-2 right-2"
								onclick={async () => {
									// await startDevServer();
									window.location.reload();
								}}
							>
								<Tooltip title="Reload">
									<Button icon={RefreshCcwIcon} size="sm" variant="fill-light" target="_blank"
									></Button>
								</Tooltip>
							</button>
						{/if}
						<iframe
							bind:this={iframeEl}
							title="LayerChart Playground"
							class="w-full h-[calc(100%-20px)]"
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
				</Pane>

				<PaneResizer class="h-0.5 bg-surface-content/10" />

				<!-- Console Header Pane (fixed size, always visible) -->
				<Pane defaultSize={5} minSize={0} maxSize={100} class="!flex-none !h-8">
					<div
						role="button"
						tabindex="-1"
						class="h-full flex justify-between items-center bg-surface-300/30 px-1 cursor-pointer group/header select-none"
						onclick={toggleConsole}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								toggleConsole();
							}
						}}
					>
						<div class="flex items-center gap-2 text-sm font-mono">
							<Icon data={SimpleIconsTerminal} class="text-surface-content/50" />
							<span class="group-hover/header:underline group-hover/header:decoration-current/50"
								>Console</span
							>
						</div>
						<button
							type="button"
							class="text-xs font-mono relative py-1 px-2 outline outline-primary/10 rounded-sm flex items-center gap-2"
							onclick={(e) => {
								e.stopPropagation();
								consoleOutput = '';
							}}>Clear <Icon data={TrashIcon} class="text-surface-content/50" /></button
						>
					</div>
				</Pane>

				<!-- Console Content Pane (collapsible) -->
				<Pane
					bind:this={consolePane as Pane}
					defaultSize={25}
					collapsedSize={0}
					minSize={0}
					maxSize={65}
					collapsible={true}
					class="[transition:flex-grow_200ms_ease-out]"
				>
					<div class="h-full flex flex-col">
						<!-- Scrolling content area -->
						<div
							bind:this={consoleScrollContainer}
							onscroll={handleConsoleScroll}
							class="flex-1 overflow-auto text-xs font-mono p-1 whitespace-pre-wrap bg-surface-100/50"
						>
							{@html consoleOutput}
						</div>
					</div>
				</Pane>
			</PaneGroup>
		</Pane>
	</PaneGroup>
</div>

<style>
	/* Hide "Edit this page" */
	:global(div:has(> a[href*='/github'])) {
		display: none;
	}
</style>
