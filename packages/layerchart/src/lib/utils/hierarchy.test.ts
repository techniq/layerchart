import { describe, it, expect } from 'vitest';

import { parseFoldedStacks } from './hierarchy.js';

describe('parseFoldedStacks', () => {
  it('builds a d3 hierarchy from folded stacks', () => {
    const root = parseFoldedStacks(`
      main;foo;bar 42
      main;foo;baz 17
      main;gc 8
    `).sum((d) => d.value);

    expect(root.data.name).toBe('root');
    expect(root.value).toBe(67); // 42 + 17 + 8

    const main = root.children![0];
    expect(main.data.name).toBe('main');
    expect(main.value).toBe(67);
    expect(main.children!.map((c) => c.data.name)).toEqual(['foo', 'gc']);

    const foo = main.children!.find((c) => c.data.name === 'foo')!;
    expect(foo.value).toBe(59); // 42 + 17
    expect(foo.children!.map((c) => `${c.data.name}=${c.value}`)).toEqual(['bar=42', 'baz=17']);
  });

  it('keeps self weight when an intermediate frame is also a leaf', () => {
    const root = parseFoldedStacks('main;foo 5\nmain;foo;bar 42').sum((d) => d.value);
    const foo = root.children![0].children![0];
    expect(foo.data.name).toBe('foo');
    expect(foo.data.value).toBe(5); // self only
    expect(foo.value).toBe(47); // inclusive: 5 self + 42 (bar)
  });

  it('accumulates repeated stacks', () => {
    const root = parseFoldedStacks('a;b 10\na;b 5');
    expect(root.children![0].children![0].data.value).toBe(15);
  });

  it('ignores blank lines and comments, and parses frame names containing spaces', () => {
    const root = parseFoldedStacks(`
      # a comment
      void Foo::run(int, int);baz 3

    `);
    expect(root.children![0].data.name).toBe('void Foo::run(int, int)');
    const baz = root.children![0].children![0];
    expect(baz.data.name).toBe('baz');
    expect(baz.data.value).toBe(3);
  });

  it('supports custom rootName and separator', () => {
    const root = parseFoldedStacks('a/b 4', { rootName: 'all', separator: '/' });
    expect(root.data.name).toBe('all');
    expect(root.children![0].data.name).toBe('a');
    expect(root.children![0].children![0].data).toMatchObject({ name: 'b', value: 4 });
  });

  it('parses fractional weights', () => {
    const root = parseFoldedStacks('a;b 1.5');
    expect(root.children![0].children![0].data.value).toBe(1.5);
  });
});
