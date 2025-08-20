import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import csv from 'csv-parser';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.resolve(__dirname, '../src/imf/dataset_2025-08-20T10_43_39.018803329Z_DEFAULT_INTEGRATION_IMF.STA_ER_4.0.1.csv');
const OUTPUT_FILE = path.resolve(__dirname, '../src/imf/fiat-monthly.json');
const COUNTRIES_FILE = path.resolve(__dirname, '../countries.json');

const loadCountriesData = () => {
  try {
    const countriesData = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf8'));
    const iso3ToCurrency = {};
    
    countriesData.features.forEach(feature => {
      const iso3 = feature.properties.iso_a3;
      const currencyCode = feature.properties.currencyCode;
      if (iso3 && currencyCode) {
        iso3ToCurrency[iso3] = currencyCode;
      }
    });
    
    return iso3ToCurrency;
  } catch (error) {
    console.error(pc.red('Error loading countries data:'), error);
    return {};
  }
};

const processFiatData = () => {
  return new Promise((resolve, reject) => {
    console.log(pc.blue(`${new Date().toISOString()} - Reading IMF exchange rate data from CSV...`));
    
    const iso3ToCurrency = loadCountriesData();
    const currencyData = {};
    
    fs.createReadStream(INPUT_FILE)
      .pipe(csv())
      .on('data', (row) => {
        const seriesCode = row['SERIES_CODE'];
        
        if (!seriesCode) return;
        
        // Extract ISO3 code from first 3 letters of SERIES_CODE
        const iso3 = seriesCode.substring(0, 3);
        const currencyCode = iso3ToCurrency[iso3];
        
        if (!currencyCode) {
          return; // Skip if no currency code found for this ISO3
        }
        
        // Initialize currency array if not exists
        if (!currencyData[currencyCode]) {
          currencyData[currencyCode] = [];
        }
        
        // Process monthly data from 2015 to 2024
        for (let year = 2024; year >= 2015; year--) {
          const monthsInYear = year === 2024 ? 12 : 12;
          
          for (let month = 12; month >= 1; month--) {
            const columnName = `${year}-M${month.toString().padStart(2, '0')}`;
            const exchangeRate = row[columnName];
            
            if (exchangeRate && exchangeRate !== '' && exchangeRate !== '…') {
              const parsedRate = parseFloat(exchangeRate);
              
              if (!isNaN(parsedRate)) {
                currencyData[currencyCode].push({
                  Date: `${year}-${month}`,
                  Price: parsedRate
                });
              }
            }
          }
        }
      })
      .on('end', () => {
        console.log(pc.blue(`${new Date().toISOString()} - Finished processing IMF exchange rate data`));
        
        // Sort each currency's data by date (newest first)
        Object.keys(currencyData).forEach(currencyCode => {
          currencyData[currencyCode].sort((a, b) => {
            const [yearA, monthA] = a.Date.split('-').map(Number);
            const [yearB, monthB] = b.Date.split('-').map(Number);
            
            if (yearA !== yearB) return yearB - yearA;
            return monthB - monthA;
          });
          
          console.log(pc.green(`${currencyCode}: ${currencyData[currencyCode].length} monthly data points`));
        });
        
        resolve(currencyData);
      })
      .on('error', reject);
  });
};

const saveFiatData = async () => {
  try {
    const currencyData = await processFiatData();
    
    if (Object.keys(currencyData).length === 0) {
      throw new Error('No valid fiat currency data found');
    }
    
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(currencyData, null, 2));
    console.log(pc.green(`${new Date().toISOString()} - ✅ Fiat currency monthly data saved to ${OUTPUT_FILE}`));
    console.log(pc.blue(`📊 Processed ${Object.keys(currencyData).length} currencies`));
    
    // Log summary
    Object.entries(currencyData).forEach(([code, data]) => {
      console.log(pc.cyan(`  ${code}: ${data.length} data points`));
    });
    
  } catch (error) {
    console.error(pc.red(`${new Date().toISOString()} - ❌ Error processing fiat data:`), error);
    process.exit(1);
  }
};

saveFiatData();