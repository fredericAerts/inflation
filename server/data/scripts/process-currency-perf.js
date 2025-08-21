import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import pc from 'picocolors';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import CurrencyPerformance from '../../models/CurrencyPerformance.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB setup
const MONGO_URI = `mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASS)}@${process.env.DB_IP}:27017/${process.env.DB_NAME}?authSource=admin`;

const client = new MongoClient(MONGO_URI);

// Helper function to check if a date is within our range (2015-01 to 2024-12)
const isDateInRange = (dateString) => {
  const [year, month] = dateString.split('-').map(Number);
  const startYear = 2015, startMonth = 1;
  const endYear = 2024, endMonth = 12;
  
  if (year < startYear || year > endYear) return false;
  if (year === startYear && month < startMonth) return false;
  if (year === endYear && month > endMonth) return false;
  
  return true;
};

// Transform fiat currency data to units_per_xau
const transformFiatData = (fiatData, goldData) => {
  const transformedData = [];
  
  // Create a map of gold prices by date for quick lookup
  const goldPriceMap = new Map();
  goldData.forEach(item => {
    if (item.Date && item.Price) {
      goldPriceMap.set(item.Date, item.Price);
    }
  });
  
  for (const [currencyCode, priceArray] of Object.entries(fiatData)) {
    if (!priceArray || priceArray.length === 0) continue;
    
    const monthlyData = [];
    
    for (const item of priceArray) {
      if (!item.Date || !item.Price) continue;
      
      // Only include dates within our range
      if (!isDateInRange(item.Date)) continue;
      
      const goldPriceUSD = goldPriceMap.get(item.Date);
      if (!goldPriceUSD) {
        console.log(pc.yellow(`⚠️  No gold price found for ${item.Date}, skipping ${currencyCode}`));
        continue;
      }
      
      // Calculate units of fiat currency per ounce of gold
      // item.Price = units of fiat per USD
      // goldPriceUSD = USD per ounce of gold
      // So: units_per_xau = (units of fiat per USD) * (USD per ounce of gold)
      const unitsPerXau = item.Price * goldPriceUSD;
      
      monthlyData.push({
        date: item.Date,
        units_per_xau: unitsPerXau
      });
    }
    
    if (monthlyData.length > 0) {
      transformedData.push({
        _id: currencyCode,
        monthly_data: monthlyData
      });
    }
  }
  
  return transformedData;
};

// Transform Bitcoin data to units_per_xau
const transformBitcoinData = (bitcoinData, goldData) => {
  // Create a map of gold prices by date for quick lookup
  const goldPriceMap = new Map();
  goldData.forEach(item => {
    if (item.Date && item.Price) {
      goldPriceMap.set(item.Date, item.Price);
    }
  });
  
  const monthlyData = [];
  
  for (const item of bitcoinData) {
    if (!item.Date || !item.Price) continue;
    
    // Only include dates within our range
    if (!isDateInRange(item.Date)) continue;
    
    const goldPriceUSD = goldPriceMap.get(item.Date);
    if (!goldPriceUSD) {
      console.log(pc.yellow(`⚠️  No gold price found for ${item.Date}, skipping Bitcoin`));
      continue;
    }
    
    // Calculate units of bitcoin per ounce of gold
    // item.Price = USD per bitcoin
    // goldPriceUSD = USD per ounce of gold
    // So: units_per_xau = (USD per ounce of gold) / (USD per bitcoin)
    const unitsPerXau = goldPriceUSD / item.Price;
    
    monthlyData.push({
      date: item.Date,
      units_per_xau: unitsPerXau
    });
  }
  
  if (monthlyData.length > 0) {
    return {
      _id: 'BTC',
      monthly_data: monthlyData
    };
  }
  
  return null;
};

const processCurrencyPerformanceData = async () => {
  try {
    console.log(pc.blue('🔄 Starting currency performance data processing...'));
    
    // Connect to MongoDB
    console.log(pc.yellow('🔌 Connecting to MongoDB...'));
    await mongoose.connect(MONGO_URI);
    console.log(pc.green('✅ Connected to MongoDB'));
    
    // Read JSON files
    const fiatDataPath = join(__dirname, '../src/imf/fiat-monthly.json');
    const goldDataPath = join(__dirname, '../src/worldbank/gold-monthly.json');
    const bitcoinDataPath = join(__dirname, '../src/fred/bitcoin-monthly.json');
    
    console.log(pc.yellow('📁 Reading data files...'));
    
    const fiatData = JSON.parse(readFileSync(fiatDataPath, 'utf8'));
    const goldData = JSON.parse(readFileSync(goldDataPath, 'utf8'));
    const bitcoinData = JSON.parse(readFileSync(bitcoinDataPath, 'utf8'));
    
    console.log(pc.green(`✅ Loaded ${Object.keys(fiatData).length} fiat currencies`));
    console.log(pc.green(`✅ Loaded ${goldData.length} gold price entries`));
    console.log(pc.green(`✅ Loaded ${bitcoinData.length} bitcoin price entries`));
    
    // Transform data
    console.log(pc.yellow('🔄 Transforming data...'));
    
    const allCurrencyData = [];
    
    // Process fiat currencies (calculate units per XAU)
    const transformedFiatData = transformFiatData(fiatData, goldData);
    allCurrencyData.push(...transformedFiatData);
    
    // Process bitcoin data (calculate units per XAU)
    const bitcoinCurrencyData = transformBitcoinData(bitcoinData, goldData);
    if (bitcoinCurrencyData) {
      allCurrencyData.push(bitcoinCurrencyData);
    }
    
    console.log(pc.green(`✅ Transformed ${allCurrencyData.length} currency datasets`));
    
    // Clear existing collection
    console.log(pc.yellow('🗑️  Clearing existing currency performance data...'));
    await CurrencyPerformance.deleteMany({});
    
    // Save to database
    console.log(pc.yellow('💾 Saving currency performance data to database...'));
    
    let savedCount = 0;
    const errors = [];
    
    for (const currencyData of allCurrencyData) {
      try {
        await CurrencyPerformance.create(currencyData);
        savedCount++;
        
        if (savedCount % 10 === 0) {
          console.log(pc.blue(`   Saved ${savedCount}/${allCurrencyData.length} currencies...`));
        }
      } catch (error) {
        errors.push({
          currency: currencyData._id,
          error: error.message
        });
        console.log(pc.red(`❌ Failed to save ${currencyData._id}: ${error.message}`));
      }
    }
    
    console.log(pc.green(`✅ Successfully saved ${savedCount} currency performance records`));
    
    if (errors.length > 0) {
      console.log(pc.yellow(`⚠️  ${errors.length} errors occurred:`));
      errors.forEach(({ currency, error }) => {
        console.log(pc.red(`   ${currency}: ${error}`));
      });
    }
    
    // Display summary statistics
    const totalRecords = await CurrencyPerformance.countDocuments();
    console.log(pc.blue(`📊 Total records in collection: ${totalRecords}`));
    
    // Sample a few currencies to show data structure
    const sampleCurrencies = await CurrencyPerformance.find({}).limit(3);
    console.log(pc.blue('📋 Sample data:'));
    sampleCurrencies.forEach(currency => {
      console.log(pc.cyan(`   ${currency._id}: ${currency.monthly_data.length} data points`));
      if (currency.monthly_data.length > 0) {
        const latest = currency.monthly_data[currency.monthly_data.length - 1];
        console.log(pc.gray(`      Latest: ${latest.date} - ${latest.units_per_xau.toFixed(2)} units per XAU`));
      }
    });
    
    console.log(pc.green('🎉 Currency performance data processing completed successfully!'));
    
  } catch (error) {
    console.error(pc.red('❌ Error processing currency performance data:'), error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log(pc.blue('📡 Disconnected from MongoDB'));
  }
};

// Execute the function if this script is run directly
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  processCurrencyPerformanceData()
    .then(() => {
      console.log(pc.green('✨ Script completed successfully'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(pc.red('💥 Script failed:'), error);
      process.exit(1);
    });
}

export default processCurrencyPerformanceData;