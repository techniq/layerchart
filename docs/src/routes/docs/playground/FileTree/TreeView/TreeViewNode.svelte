<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cls } from '@layerstack/tailwind';
	import VscodeIconsFileTypeSvelte from '~icons/vscode-icons/file-type-svelte';
	import VscodeIconsFileTypeTypescript from '~icons/vscode-icons/file-type-typescript';
	import VscodeIconsFileTypeJavascript from '~icons/vscode-icons/file-type-js';
	import VscodeIconsFileTypeCss from '~icons/vscode-icons/file-type-css';
	import File from '~icons/lucide/file';
	import Folder from '~icons/lucide/folder';
	import FolderOpen from '~icons/lucide/folder-open';
	import type { TreeViewNodeProps } from './types';
	import { Icon } from 'svelte-ux';

	let {
		name,
		path,
		open = $bindable(true),
		selected = false,
		onSelect,
		class: className,
		icon,
		children,
		type = 'button',
		onclick,
		...rest
	}: TreeViewNodeProps = $props();

	function handleClick() {
		if (path && onSelect) {
			onSelect(path);
		}
	}

	function toggleOpen() {
		open = !open;
	}

	let fileIcon = $derived.by(() => {
		if (name.endsWith('.svelte')) {
			return VscodeIconsFileTypeSvelte;
		} else if (name.endsWith('.ts')) {
			return VscodeIconsFileTypeTypescript;
		} else if (name.endsWith('.js')) {
			return VscodeIconsFileTypeJavascript;
		} else if (name.endsWith('.css')) {
			return VscodeIconsFileTypeCss;
		} else {
			return File;
		}
	});
</script>

{#if name.includes('.')}
	<!-- It's a file! -->
	<button
		{type}
		class={cls(
			'flex place-items-center gap-2 pl-[3px] hover:text-primary/80',
			selected && 'text-primary/80 group-hover:text-inherit',
			className
		)}
		onclick={handleClick}
		{...rest}
	>
		{#if icon}
			<!-- Custom icon -->
			{@render icon({ name, open })}
		{:else}
			<!-- Icon based on file extension -->
			<Icon data={fileIcon} class="size-4" />
		{/if}
		<span>{name}</span>
	</button>
{:else}
	<!-- It's a folder! -->
	<div>
		<button
			type="button"
			class={cls('flex place-items-center gap-2 group/folder', className)}
			onclick={toggleOpen}
		>
			{#if icon}
				<!-- Custom icon -->
				{@render icon({ name, open })}
			{:else if open}
				<!-- Folder open icon -->
				<FolderOpen class="size-4 text-surface-content" />
			{:else}
				<!-- Folder closed icon -->
				<Folder class="size-4 text-surface-content" />
			{/if}
			<span class="group-hover/folder:text-primary/80">{name}</span>
		</button>
		{#if open}
			<div class="mx-2 border-l" transition:slide={{ duration: 150 }}>
				<div class="relative flex place-items-start">
					<!-- Alignment Line -->
					<div class="bg-border mx-2 h-full w-px"></div>
					<div class="flex flex-col">
						{@render children?.()}
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
