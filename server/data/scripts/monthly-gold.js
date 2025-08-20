import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import csv from 'csv-parser';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.resolve(__dirname, '../src/worldbank/CMO-Historical-Data-Monthly/Monthly Prices-Table 1.csv');
const OUTPUT_FILE = path.resolve(__dirname, '../src/worldbank/gold-monthly.json');

const processGoldData = () => {
  return new Promise((resolve, reject) => {
    console.log(pc.blue(`${new Date().toISOString()} - Reading Gold price data from CSV...`));
    
    // Check if input file exists
    if (!fs.existsSync(INPUT_FILE)) {
      console.error(pc.red(`${new Date().toISOString()} - ❌ Input file not found: ${INPUT_FILE}`));
      reject(new Error(`Input file not found: ${INPUT_FILE}`));
      return;
    }
    
    const monthlyData = [];
    
    fs.createReadStream(INPUT_FILE)
      .pipe(csv({ separator: ';' })) // World Bank file uses semicolon separator
      .on('data', (row) => {
        const date = row['Date'];
        const goldPrice = row['Gold'];
        
        // Skip empty values
        if (!date || !goldPrice || goldPrice === '' || goldPrice === '…') return;
        
        // Parse the date to extract year and month
        let year, month;
        
        // Handle YYYYMXX format (e.g., "1960M01")
        const dateMatch = date.match(/^(\d{4})M(\d{2})$/);
        if (dateMatch) {
          year = parseInt(dateMatch[1]);
          month = parseInt(dateMatch[2]);
        } else {
          console.log(pc.yellow(`${new Date().toISOString()} - ⚠️  Could not parse date: ${date}`));
          return;
        }
        
        // Only process years 2015-2024 and valid months
        if (year >= 2015 && year <= 2024 && month >= 1 && month <= 12) {
          const parsedPrice = parseFloat(goldPrice.replace(',', '.'));
          
          if (!isNaN(parsedPrice)) {
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            
            monthlyData.push({
              Date: monthKey,
              Price: Math.round(parsedPrice * 1000) / 1000 // Round to 3 decimal places
            });
            
            console.log(pc.green(`${monthKey}: $${parsedPrice.toFixed(2)}`));
          }
        }
      })
      .on('end', () => {
        console.log(pc.blue(`${new Date().toISOString()} - Finished processing Gold data`));
        
        // Sort by date (newest first, like bitcoin data)
        monthlyData.sort((a, b) => {
          // Extract year and month for comparison
          const [yearA, monthA] = a.Date.split('-').map(Number);
          const [yearB, monthB] = b.Date.split('-').map(Number);
          
          if (yearA !== yearB) return yearB - yearA; // Newer year first
          return monthB - monthA; // Newer month first
        });
        
        resolve(monthlyData);
      })
      .on('error', (error) => {
        console.error(pc.red(`${new Date().toISOString()} - ❌ Error reading CSV:`), error);
        reject(error);
      });
  });
};

const saveGoldData = async () => {
  try {
    const monthlyData = await processGoldData();
    
    if (monthlyData.length === 0) {
      throw new Error('No valid Gold data found');
    }
    
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(monthlyData, null, 2));
    console.log(pc.green(`${new Date().toISOString()} - ✅ Gold monthly data saved to ${OUTPUT_FILE}`));
    console.log(pc.blue(`📊 Processed ${monthlyData.length} months of Gold price data`));
    
  } catch (error) {
    console.error(pc.red(`${new Date().toISOString()} - ❌ Error processing Gold data:`), error);
    process.exit(1);
  }
};

saveGoldData();