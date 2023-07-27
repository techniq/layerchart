import { $ } from 'execa';
import * as fs from 'fs/promises';

const logs = (await $`git log --pretty=oneline`).stdout.split('\n');

const commitsByVersion = new Map();
let currentVersion = 'next';
commitsByVersion.set(currentVersion, []);

for (const log of logs) {
  const [s1, sha, message] = log.match(/^(\w*) (.*)/);
  const [s2, version] = message?.match(/Version bump to (\d+\.\d+\.\d+)/) ?? [];

  if (version) {
    currentVersion = version;
    commitsByVersion.set(currentVersion, []);
  } else {
    const commits = commitsByVersion.get(currentVersion);
    commits.push({
      sha,
      message,
    });
  }
}

let changelog = '';
for (const [version, commits] of commitsByVersion) {
  changelog += `## ${version}\n\n`;

  changelog += `### Commits\n\n`;

  for (const { sha, message } of commits) {
    changelog += `- ${message} ([${sha.slice(
      0,
      6
    )}](https://github.com/techniq/svelte-ux/commit/${sha}))\n`;
  }

  changelog += `\n`;
}

await fs.writeFile('CHANGELOG_COMMITS.md', changelog);
