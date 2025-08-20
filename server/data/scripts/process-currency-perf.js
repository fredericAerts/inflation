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

// Helper function to generate date strings for the expected date range
const generateDateStrings = (startIndex, length) => {
  const dates = [];
  const startYear = 2015;
  const startMonth = 1;
  
  for (let i = 0; i < length; i++) {
    const totalMonths = (startYear * 12) + startMonth - 1 + startIndex + i;
    const year = Math.floor(totalMonths / 12);
    const month = (totalMonths % 12) + 1;
    const dateString = `${year}-${month.toString().padStart(2, '0')}`;
    
    // Only include dates within our range (2015-01 to 2024-12)
    if (year >= 2015 && year <= 2024) {
      dates.push(dateString);
    }
  }
  
  return dates;
};

// Transform fiat currency data (IMF format)
const transformFiatData = (fiatData) => {
  const transformedData = [];
  
  for (const [currencyCode, priceArray] of Object.entries(fiatData)) {
    if (!priceArray || priceArray.length === 0) continue;
    
    // The fiat data appears to be in reverse chronological order (newest to oldest)
    // We need to reverse it and take the data from 2015-01 onwards
    const reversedData = [...priceArray].reverse();
    
    // Calculate the expected number of months from 2015-01 to 2024-12
    const expectedMonths = (2024 - 2015 + 1) * 12; // 120 months
    
    // Take only the data we need (last 120 months if available)
    const relevantData = reversedData.slice(-expectedMonths);
    
    // Generate dates starting from 2015-01
    const dates = generateDateStrings(0, relevantData.length);
    
    const monthlyData = relevantData.map((item, index) => {
      if (index < dates.length && item && typeof item.Price === 'number') {
        return {
          date: dates[index],
          price_usd: item.Price
        };
      }
      return null;
    }).filter(Boolean);
    
    // Only add currencies that have valid data
    if (monthlyData.length > 0) {
      transformedData.push({
        _id: currencyCode,
        monthly_data: monthlyData
      });
    }
  }
  
  return transformedData;
};

// Transform WorldBank/FRED data (Date/Price format)
const transformDatePriceData = (data, currencyCode) => {
  if (!data || data.length === 0) return null;
  
  // Filter data to only include dates within our range
  const filteredData = data.filter(item => isDateInRange(item.Date));
  
  if (filteredData.length === 0) return null;
  
  const monthlyData = filteredData.map(item => ({
    date: item.Date,
    price_usd: item.Price
  }));
  
  return {
    _id: currencyCode,
    monthly_data: monthlyData
  };
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
    
    // Process fiat currencies
    const transformedFiatData = transformFiatData(fiatData);
    allCurrencyData.push(...transformedFiatData);
    
    // Process gold data
    const goldCurrencyData = transformDatePriceData(goldData, 'GOLD');
    if (goldCurrencyData) {
      allCurrencyData.push(goldCurrencyData);
    }
    
    // Process bitcoin data
    const bitcoinCurrencyData = transformDatePriceData(bitcoinData, 'BTC');
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
        console.log(pc.gray(`      Latest: ${latest.date} - $${latest.price_usd}`));
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