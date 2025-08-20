import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import csv from 'csv-parser';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.resolve(__dirname, '../src/fred/CBBTCUSD.csv');
const OUTPUT_FILE = path.resolve(__dirname, '../src/fred/bitcoin-monthly.json');

const processBitcoinData = () => {
  return new Promise((resolve, reject) => {
    console.log(pc.blue(`${new Date().toISOString()} - Reading Bitcoin price data from CSV...`));
    
    const monthlyData = {};
    
    fs.createReadStream(INPUT_FILE)
      .pipe(csv())
      .on('data', (row) => {
        const date = row['observation_date'];
        const price = row['CBBTCUSD'];
        
        // Skip empty price values
        if (!date || !price || price === '') return;
        
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1; // getMonth() returns 0-11, we want 1-12
        const priceValue = parseFloat(price);
        
        // Only process years 2015-2024 and valid prices
        if (year >= 2015 && year <= 2024 && !isNaN(priceValue)) {
          const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              total: 0,
              count: 0
            };
          }
          
          monthlyData[monthKey].total += priceValue;
          monthlyData[monthKey].count += 1;
        }
      })
      .on('end', () => {
        console.log(pc.blue(`${new Date().toISOString()} - Finished processing Bitcoin data`));
        
        // Calculate monthly averages and format like gold data
        const monthlyAverages = [];
        
        // Generate all months from 2015-01 to 2024-12
        for (let year = 2024; year >= 2015; year--) {
          const monthsToProcess = year === 2024 ? 12 : 12; // Process all 12 months for each year
          const startMonth = year === 2024 ? 12 : 12;
          
          for (let month = startMonth; month >= 1; month--) {
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            
            if (monthlyData[monthKey] && monthlyData[monthKey].count > 0) {
              const average = monthlyData[monthKey].total / monthlyData[monthKey].count;
              monthlyAverages.push({
                Date: monthKey,
                Price: Math.round(average * 1000) / 1000 // Round to 3 decimal places
              });
              console.log(pc.green(`${monthKey}: $${average.toFixed(2)} (${monthlyData[monthKey].count} data points)`));
            } else {
              console.log(pc.yellow(`${monthKey}: No data available`));
            }
          }
        }
        
        resolve(monthlyAverages);
      })
      .on('error', reject);
  });
};

const saveBitcoinData = async () => {
  try {
    const monthlyData = await processBitcoinData();
    
    if (monthlyData.length === 0) {
      throw new Error('No valid Bitcoin data found');
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(monthlyData, null, 2));
    console.log(pc.green(`${new Date().toISOString()} - ✅ Bitcoin monthly data saved to ${OUTPUT_FILE}`));
    console.log(pc.blue(`📊 Processed ${monthlyData.length} months of Bitcoin price data`));
    
  } catch (error) {
    console.error(pc.red(`${new Date().toISOString()} - ❌ Error processing Bitcoin data:`), error);
    process.exit(1);
  }
};

saveBitcoinData();
