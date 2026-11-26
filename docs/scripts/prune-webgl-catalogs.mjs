// `@layerchart/webgl`'s catalogs are generated from every example, as LayerChart's are, but used only
// for its own components (ex. `Surface`): LayerChart's list every example of theirs (ex. `Points`),
// whichever package draws it.  Removes its catalogs of components LayerChart has.
import fs from 'node:fs';
import path from 'node:path';

const [catalogDir = 'src/examples/catalog'] = process.argv.slice(2);
const webglDir = path.join(catalogDir, 'webgl');
for (const file of fs.readdirSync(webglDir)) {
	if (fs.existsSync(path.join(catalogDir, file))) fs.rmSync(path.join(webglDir, file));
}
