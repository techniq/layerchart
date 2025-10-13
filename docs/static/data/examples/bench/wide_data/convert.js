import fs from 'node:fs';

function parseMetricsData(data) {
  // Parse the string if it's not already an array
  const rawData = typeof data === 'string' ? JSON.parse(data) : data;
  const fieldLength = rawData[0];

  // Extract the header fields
  const [_, ...fields] = rawData.slice(0, fieldLength + 1);

  // Get the actual data values
  const values = rawData.slice(fieldLength + 1);

  // Calculate how many complete sets of metrics we have
  const numSets = Math.floor(values.length / fieldLength);

  // Transform the data into objects
  const result = [];
  for (let i = 0; i < numSets; i++) {
    const obj = {};
    fields.forEach((field, fieldIndex) => {
      obj[field] = values[i * fieldLength + fieldIndex];
    });
    result.push(obj);
  }

  return result;
}

try {
  const inputFile = '../packedData.json';
  const outputFile = 'data.json';

  // Read and parse the input file
  const data = fs.readFileSync(inputFile, 'utf8');
  const parsedData = parseMetricsData(data);
  fs.writeFileSync(outputFile, JSON.stringify(parsedData));

  console.log(`Successfully transformed data from ${inputFile} to ${outputFile}`);
} catch (error) {
  console.error('Error processing file:', error.message);
  process.exit(1);
}
