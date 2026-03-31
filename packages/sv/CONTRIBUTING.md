# Contributing Guide

Cheatsheet: [All official add-ons source code](https://github.com/sveltejs/cli/tree/main/packages/sv/src/addons)

---

Some convenient scripts are provided to help develop the add-on.

```sh
## create a new minimal project in the `demo` directory
npm run demo-create

## add your current add-on to the demo project
npm run demo-add

## run the tests
npm run test
```

## Key things to note

Your `add-on` should:

- export a function that returns a `defineAddon` object.
- have a `package.json` with an `exports` field that points to the main entry point of the add-on.

## Building

Your add-on is bundled with [tsdown](https://tsdown.dev/) into a single file in `dist/`. This bundles everything except `sv` (which is a peer dependency provided at runtime).

```sh
npm run build
```

## Publishing

When you're ready to publish your add-on to npm:

```sh
npm login
npm publish
```

> `prepublishOnly` will automatically run the build before publishing.

## Things to be aware of

Community add-ons must have `sv` as a `peerDependency` and should **not** have any `dependencies`. Everything else (including `@sveltejs/sv-utils`) is bundled at build time by tsdown.
