import 'unplugin-icons/types/svelte';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// File System Access API (not in default DOM lib)
	interface FilePickerAcceptType {
		description?: string;
		accept?: Record<string, string | string[]>;
	}
	interface SaveFilePickerOptions {
		suggestedName?: string;
		types?: FilePickerAcceptType[];
		excludeAcceptAllOption?: boolean;
	}
	interface Window {
		showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
	}
}

export {};
