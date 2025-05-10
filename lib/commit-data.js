import fs from 'fs';
import path from 'path';
import * as d3 from 'd3';

/**
 * Preprocesses the commit data from the CSV file
 * This will run at build time to generate a static JSON file
 */
export async function preprocessCommitData() {
  try {
    // Define the path to the CSV file
    const csvFilePath = path.join(process.cwd(), 'public', 'meta', 'loc.csv');
    const jsonOutputPath = path.join(process.cwd(), 'public', 'meta', 'commit-data.json');
    
    // Check if CSV exists
    if (!fs.existsSync(csvFilePath)) {
      console.error('CSV file not found at', csvFilePath);
      return null;
    }
    
    // Read the CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse the CSV data
    const parsedData = d3.csvParse(csvContent, (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: row.date + 'T00:00' + row.timezone,
      datetime: row.datetime,
    }));
    
    // Process the commits
    const commits = processCommits(parsedData);
    
    // Save the processed data to a JSON file
    const outputData = {
      data: parsedData,
      commits: commits
    };
    
    fs.writeFileSync(jsonOutputPath, JSON.stringify(outputData));
    
    return outputData;
  } catch (error) {
    console.error('Error preprocessing commit data:', error);
    return null;
  }
}

/**
 * Process the commit data from CSV rows
 * @param {Array} data - Parsed CSV data
 * @returns {Array} - Processed commit objects
 */
function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      
      // Create date object for consistent datetime handling
      const dateObj = new Date(datetime);
      
      let ret = {
        id: commit,
        url: 'https://github.com/cartert27/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime: datetime,
        hourFrac: dateObj.getHours() + dateObj.getMinutes() / 60,
        totalLines: lines.length,
        // Keep lines as an enumerable property for JSON serialization
        lines: lines
      };
      
      return ret;
    });
}

/**
 * Gets the commit data - either from the generated JSON file or by processing it on-demand
 * @returns {Object} - The processed commit data
 */
export async function getCommitData() {
  try {
    const jsonFilePath = path.join(process.cwd(), 'public', 'meta', 'commit-data.json');
    
    // Check if the preprocessed JSON file exists
    if (fs.existsSync(jsonFilePath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
      return jsonData;
    }
    
    // If not, process the data on-demand (fallback)
    return await preprocessCommitData();
  } catch (error) {
    console.error('Error getting commit data:', error);
    return null;
  }
} 