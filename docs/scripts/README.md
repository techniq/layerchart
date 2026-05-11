# Docs Support Files

The reusable generators now live in `@layerstack/docs` and are exposed through the
`layerstack-docs` CLI. The docs app keeps only project-specific template files in
this directory.

Common commands from `docs/package.json`:

```bash
pnpm generate:api
pnpm generate:catalog
pnpm generate:screenshots
pnpm generate:stackblitz
pnpm generate:releases
```

The commands expand to `layerstack-docs ...` invocations with LayerChart-specific
paths.
