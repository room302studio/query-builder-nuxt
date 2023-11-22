import * as d3 from 'd3';
import fs from 'fs';

export default defineEventHandler(async (event) => {
  const csvFilePath = 'assets/data/data_uof-new-orleans-pd.csv';

  // Read the .csv file
  const csvData = fs.readFileSync(csvFilePath, 'utf-8');

  // Parse the .csv data into JSON using d3
  const jsonData = d3.csvParse(csvData);

  return {data: jsonData};
});
