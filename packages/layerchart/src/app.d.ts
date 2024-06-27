// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  // interface Error {}
  // interface Locals {}

  interface PageData {
    meta: {
      title?: string;
      description?: string;
      source?: string;
      pageSource?: string;
      api?: SveldJson;
      features?: string[];
      related?: string[];
      hideUsage?: boolean;
      hideTableOfContents?: boolean;
      status?: string;
    };
  }

  // interface PageState {}
  // interface Platform {}
}
