<script lang="ts">
	import { cls } from '@layerstack/tailwind';
	import * as TreeView from './TreeView';

	type FileTreeProps = {
		filePaths: string[];
		selectedFile?: string;
		openAllNodes?: boolean;
		alphabetize?: boolean;
		class?: string;
		onSelect?: (path: string) => void;
	};

	let {
		filePaths,
		selectedFile = $bindable(''),
		openAllNodes = false,
		alphabetize = true,
		class: className = '',
		onSelect
	}: FileTreeProps = $props();

	type TreeNode = {
		name: string;
		path: string;
		open: boolean;
		children: TreeNode[];
	};

	function sortNodes(nodes: TreeNode[]): TreeNode[] {
		nodes.sort((a, b) => {
			const aIsFolder = a.children.length > 0;
			const bIsFolder = b.children.length > 0;
			if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
		nodes.forEach((node) => sortNodes(node.children));
		return nodes;
	}

	let tree = $derived.by(() => {
		const result: TreeNode[] = [];

		function createNode(filePath: string, isOpen = false): void {
			const parts = filePath.split('/');
			let currentLevel = result;
			let currentPath = '';

			parts.forEach((part, i) => {
				currentPath = currentPath ? `${currentPath}/${part}` : part;
				const isLastPart = i === parts.length - 1;

				let existingNode = currentLevel.find((node) => node.name === part);

				if (!existingNode) {
					const newNode: TreeNode = {
						name: part,
						path: currentPath,
						open: isOpen && !isLastPart,
						children: []
					};
					currentLevel.push(newNode);
					existingNode = newNode;
				} else if (isOpen && !isLastPart) {
					existingNode.open = true;
				}

				currentLevel = existingNode.children;
			});
		}

		filePaths.forEach((file) => createNode(file, file === selectedFile || openAllNodes));
		return alphabetize ? sortNodes(result) : result;
	});
</script>

<div class={cls(className, 'group')}>
	{#snippet renderNodes(nodes: TreeNode[])}
		{#each nodes as node (node.path)}
			<TreeView.Node
				name={node.name}
				path={node.path}
				open={node.open}
				selected={!!selectedFile && selectedFile === node.path}
				onSelect={(path: string) => {
					selectedFile = path;
					onSelect?.(path);
				}}
			>
				{@render renderNodes(node.children)}
			</TreeView.Node>
		{/each}
	{/snippet}

	<TreeView.Root>
		{@render renderNodes(tree)}
	</TreeView.Root>
</div>
