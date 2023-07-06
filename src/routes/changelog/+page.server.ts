import * as fs from 'node:fs/promises';

export async function load({ platform, url }) {
  const changelog = await fs.readFile('./CHANGELOG.md', 'utf-8');

  return { changelog };
}
