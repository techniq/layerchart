<script lang="ts" module>
	import { WebContainer } from '@webcontainer/api';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import { Icon } from 'svelte-ux';
	import SimpleIconsCss from '~icons/simple-icons/css';
	import SimpleIconsJavascript from '~icons/simple-icons/javascript';
	import SimpleIconsTypescript from '~icons/simple-icons/typescript';
	import SimpleIconsTerminal from '~icons/simple-icons/windowsterminal';
	import SimpleIconsSvelte from '~icons/simple-icons/svelte';
	import RefreshCcwIcon from '~icons/lucide/refresh-ccw';
	import TrashIcon from '~icons/lucide/trash';

	// Singleton instance stored in globalThis to persist across hot reloads
	const WEBCONTAINER_KEY = '__webcontainer_instance__';

	declare global {
		interface Window {
			[WEBCONTAINER_KEY]?: Promise<WebContainer>;
		}
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import CodeEditor from './CodeEditor.svelte';
	import { Overlay, ProgressCircle } from 'svelte-ux';
	import { AnsiUp } from 'ansi_up';

	let { data }: { data: PageData } = $props();
	const ansiUp = new AnsiUp();

	let iframeEl = $state<HTMLIFrameElement | null>(null);
	let webcontainerInstance = $state<WebContainer | null>(null);

	let consolePane: ReturnType<typeof Pane>;
	let consoleCollapsed = $state(true);
	let consoleOutput = $state('');

	let fileIcon = $derived.by(() => {
		if (selectedFile.endsWith('.svelte')) {
			return SimpleIconsSvelte;
		} else if (selectedFile.endsWith('.ts')) {
			return SimpleIconsTypescript;
		} else if (selectedFile.endsWith('.js')) {
			return SimpleIconsJavascript;
		} else if (selectedFile.endsWith('.css')) {
			return SimpleIconsCss;
		} else {
			return SimpleIconsTerminal;
		}
	});

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
						const logText = args.map((arg: any) => {
							if (typeof arg === 'object') {
								return JSON.stringify(arg, null, 2);
							}
							return String(arg);
						}).join(' ');

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
					console.log('[WebContainer]:', text);

					// Append to console output (converting ANSI codes to HTML)
					consoleOutput += ansiUp.ansi_to_html(text);

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
	<PaneGroup direction="horizontal">
		<Pane defaultSize={50} minSize={5}>
			<div class="flex flex-col h-full border-r border-surface-content/10">
				<!-- File Selector -->
				<div class="p-2 border-b border-surface-content/10 bg-surface-100 relative">
					<select
						bind:value={selectedFile}
						onchange={() => handleFileSelect(selectedFile)}
						class="w-full px-8 py-2 rounded border border-surface-content/20 bg-surface text-sm font-mono"
					>
						{#each editableFiles as file}
							<option value={file}>{file}</option>
						{/each}
					</select>
					<Icon
						data={fileIcon}
						class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-content/50"
					/>
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

		<PaneResizer
			data-enabled={!isLoadingFile && !isReady}
			class="w-1 hover:bg-surface-content/10"
		/>

		<!-- Preview Panel -->
		<Pane defaultSize={50} minSize={5}>
			<PaneGroup direction="vertical">
				<Pane defaultSize={90}>
					<div class="relative h-full bg-surface-100 pt-6">
						{#if loadingStatus}
							<Overlay class="flex flex-col gap-4 bg-surface-100/50" center>
								<ProgressCircle width={2} />
								<div class="text-lg font-medium">{loadingStatus}</div>
							</Overlay>
						{:else}
							<button
								class="absolute top-2 right-2"
								onclick={() => {
									window.location.reload();
								}}
							>
								<Icon
									data={RefreshCcwIcon}
									class="text-surface-content/50 hover:text-primary absolute top-2 right-2"
								/>
							</button>
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
				</Pane>

				<PaneResizer
					data-enabled={!isLoadingFile && !isReady}
					class="h-1 hover:bg-surface-content/10"
				/>

				<!-- Console Panel -->
				<Pane
					bind:this={consolePane as Pane}
					defaultSize={20}
					collapsedSize={10}
					minSize={10}
					maxSize={50}
					collapsible={true}
					onCollapse={() => (consoleCollapsed = true)}
					onExpand={() => (consoleCollapsed = false)}
				>
					<div class="h-full overflow-auto relative bg-surface-300">
						<div class="flex justify-between items-center bg-primary/10 p-1">
							<div class="flex-1">
								<button
									class="flex items-center justify-start gap-2 text-sm font-mono group w-full"
									onclick={() =>
										consolePane.isCollapsed() ? consolePane.expand() : consolePane.collapse()}
								>
									<Icon data={SimpleIconsTerminal} class=" text-surface-content/50" />
									<span class="group-hover:underline">Console</span>
								</button>
							</div>
							<button
								class="text-xs font-mono relative py-1 px-2 outline outline-primary/10 rounded-sm flex items-center gap-2"
								onclick={() => (consoleOutput = '')}
								>Clear <Icon data={TrashIcon} class="text-surface-content/50" /></button
							>
						</div>
						<div class="text-xs font-mono p-1 whitespace-pre-wrap">
							{@html consoleOutput}
						</div>
					</div>
				</Pane>
			</PaneGroup>
		</Pane>
	</PaneGroup>
</div>
