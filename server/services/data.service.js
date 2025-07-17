import { promises as fs } from 'fs';
import path from 'path';

async function fetchCountriesJson() {
  try {
    const filePath = path.join(process.cwd(), 'server', 'data', 'countries.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('[fetchCountriesJson] Failed to read countries.json:', error);
    throw error;
  }
}

export {
  fetchCountriesJson
};