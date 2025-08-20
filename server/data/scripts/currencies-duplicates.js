import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURRENCIES_FILE = path.resolve(__dirname, '../src/datahub/currencies.json');

const findDuplicateEntities = () => {
  try {
    console.log(pc.blue(`${new Date().toISOString()} - Reading currencies data from JSON...`));
    
    const currenciesData = JSON.parse(fs.readFileSync(CURRENCIES_FILE, 'utf8'));
    
    // Create a map to track entities and their occurrences
    const entityMap = new Map();
    
    // Count occurrences of each entity
    currenciesData.forEach((entry, index) => {
      const entity = entry.Entity;
      
      if (!entityMap.has(entity)) {
        entityMap.set(entity, []);
      }
      
      entityMap.get(entity).push({
        index,
        ...entry
      });
    });
    
    // Find duplicates
    const duplicates = [];
    entityMap.forEach((entries, entity) => {
      if (entries.length > 1) {
        duplicates.push({
          entity,
          count: entries.length,
          entries
        });
      }
    });
    
    // Log results
    if (duplicates.length === 0) {
      console.log(pc.green(`${new Date().toISOString()} - ✅ No duplicate entities found`));
    } else {
      console.log(pc.yellow(`${new Date().toISOString()} - ⚠️  Found ${duplicates.length} entities with duplicates:`));
      console.log('');
      
      duplicates.forEach(({ entity, count, entries }) => {
        console.log(pc.red(`📍 Entity: "${entity}" (${count} occurrences)`));
        entries.forEach((entry, i) => {
          console.log(pc.cyan(`   ${i + 1}. Currency: ${entry.Currency}, Code: ${entry.AlphabeticCode}, Index: ${entry.index}`));
        });
        console.log('');
      });
      
      // Summary
      const totalDuplicateEntries = duplicates.reduce((sum, dup) => sum + dup.count, 0);
      console.log(pc.blue(`📊 Summary:`));
      console.log(pc.blue(`   - Unique entities with duplicates: ${duplicates.length}`));
      console.log(pc.blue(`   - Total duplicate entries: ${totalDuplicateEntries}`));
      console.log(pc.blue(`   - Total entries in file: ${currenciesData.length}`));
    }
    
  } catch (error) {
    console.error(pc.red(`${new Date().toISOString()} - ❌ Error processing currencies file:`), error);
    process.exit(1);
  }
};

findDuplicateEntities();