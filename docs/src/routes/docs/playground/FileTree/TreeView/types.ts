import type { WithChildren } from 'bits-ui';
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export type TreeViewRootProps = HTMLAttributes<HTMLDivElement>;

export type TreeViewNodeProps = WithChildren<
	Omit<HTMLButtonAttributes, 'children'> & {
		name: string;
		path?: string;
		open?: boolean;
		selected?: boolean;
		onSelect?: (path: string) => void;
		icon?: Snippet<[{ name: string; open: boolean }]>;
	}
>;
