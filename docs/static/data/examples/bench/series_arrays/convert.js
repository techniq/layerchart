import fs from 'node:fs';
import { round } from '@layerstack/utils';

function prepData(packed) {
  // epoch,idl,recv,send,read,writ,used,free
  const numFields = packed[0];
  packed = packed.slice(numFields + 1);

  var cpu = Array(packed.length / numFields);
  var ram = Array(packed.length / numFields);
  var tcp = Array(packed.length / numFields);

  for (let i = 0, j = 0; i < packed.length; i += numFields, j++) {
    let date = packed[i] * 60 * 1000;
    cpu[j] = { x: date, y: round(100 - packed[i + 1], 3) };
    ram[j] = { x: date, y: round((100 * packed[i + 5]) / (packed[i + 5] + packed[i + 6]), 2) };
    tcp[j] = { x: date, y: packed[i + 3] };
  }

  return { cpu, ram, tcp };
}

try {
  const inputFile = '../packedData.json';
  const outputFile = 'data.json';

  const packedData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const data = prepData(packedData);
  fs.writeFileSync(outputFile, JSON.stringify(data));

  console.log(`Successfully transformed data from ${inputFile} to ${outputFile}`);
} catch (error) {
  console.error('Error processing file:', error.message);
  process.exit(1);
}
