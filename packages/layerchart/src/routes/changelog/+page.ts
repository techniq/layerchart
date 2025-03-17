export async function load({ fetch }) {
  return {
    changelog: await fetch(
      'https://raw.githubusercontent.com/techniq/layerchart/main/packages/layerchart/CHANGELOG.md'
    ).then(async (r) => await r.text()),
  };
}
