# StackBlitz Templates

This directory contains template files used to generate StackBlitz projects for LayerChart examples.

## Files

- **package.json** - Base package.json with LayerChart, SvelteKit, and Tailwind CSS dependencies
- **svelte.config.js** - Svelte configuration for SvelteKit
- **vite.config.js** - Vite configuration with Tailwind CSS plugin
- **app.html** - HTML template for SvelteKit app
- **app.css** - Tailwind CSS import file
- **+layout.svelte** - Root layout component with app.css import and basic styling
- **.gitignore** - Git ignore file for SvelteKit projects

## Usage

These templates are read by `build-stackblitz-files.ts` and combined into a single JSON file at `static/stackblitz-files.json`.

To regenerate the StackBlitz files after editing templates:

```bash
pnpm generate:stackblitz
```

## Notes

- **svelte-check warning**: When running `pnpm check`, you may see an error about loading `svelte.config.js` in this directory. This is expected and can be safely ignored - the dependencies referenced in the config aren't installed here since these are just template files.
- Edit these template files directly to change the base StackBlitz project structure for all examples.
