# Sveltest Helper

**Comprehensive testing tools and examples for building robust Svelte
5 applications**

This skill provides a complete testing framework for SvelteKit
projects using vitest-browser-svelte. It includes patterns, best
practices, and real-world examples for client-side, server-side, and
SSR testing.

## What You'll Find Here

- ✅ **Foundation First methodology** - Plan comprehensive test
  coverage before coding
- ✅ **Real browser testing** - Using vitest-browser-svelte with
  Playwright
- ✅ **Client-Server alignment** - Test with real FormData/Request
  objects
- ✅ **Svelte 5 runes patterns** - Proper use of untrack(), $derived,
  and $effect
- ✅ **Common pitfalls solved** - Strict mode, form submission,
  accessibility
- ✅ **Production-ready examples** - Copy-paste test templates

## For Developers

Use this as a quick reference guide when writing tests:

- Browse `SKILL.md` for quick patterns and reminders
- Check `references/detailed-guide.md` for comprehensive examples
- Follow the "Unbreakable Rules" to avoid common mistakes

## For AI Assistants

This skill is automatically invoked by Claude Code when working with
tests in SvelteKit projects. It provides context-aware guidance for
creating and maintaining high-quality tests.

## Structure

- **SKILL.md** - Quick reference for common patterns
- **references/detailed-guide.md** - Complete testing guide with
  examples

## Quick Start

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:client    # Browser component tests
pnpm test:server    # API and server logic tests
pnpm test:ssr       # Server-side rendering tests

# Generate coverage
pnpm coverage
```
