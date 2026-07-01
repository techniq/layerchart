import fs from 'node:fs';
import { round } from '@layerstack/utils';

function prepData(packed) {
  // epoch,idl,recv,send,read,writ,used,free
  const numFields = packed[0];
  packed = packed.slice(numFields + 1);

  let data = [
    Array(packed.length / numFields), // date
    Array(packed.length / numFields), // cpu
    Array(packed.length / numFields), // ram
    Array(packed.length / numFields), // tcp
  ];

  for (let i = 0, j = 0; i < packed.length; i += numFields, j++) {
    data[0][j] = packed[i] * 60 * 1000;
    data[1][j] = round(100 - packed[i + 1], 3);
    data[2][j] = round((100 * packed[i + 5]) / (packed[i + 5] + packed[i + 6]), 2);
    data[3][j] = packed[i + 3];
  }

  return { date: data[0], cpu: data[1], ram: data[2], tcp: data[3] };
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
