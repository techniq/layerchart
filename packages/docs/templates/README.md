# Templates

Reusable project templates used by the `layerstack-docs` CLI.

## StackBlitz

The `stackblitz-template` directory is the conventional base project used by:

```bash
layerstack-docs generate-stackblitz <template-dir> <source-dir> <output-file> [remote-sources-file]
```

LayerStack docs apps can use it directly from package scripts:

```json
{
	"scripts": {
		"generate:stackblitz": "layerstack-docs generate-stackblitz ../packages/docs/templates/stackblitz-template src static/stackblitz-files.json static/remote-sources.json"
	}
}
```

Project-specific source files are layered on with `--source output=source` and `--remote output=source`.
