import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import pc from 'picocolors';

const TIME_PERIOD = [2015, 2024]; // last 10 years

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imfInputFile = path.resolve(__dirname, '../src/imf/dataset_2025-08-18T13_51_04.709096225Z_DEFAULT_INTEGRATION_IMF.STA_CPI_5.0.0.csv');
const bisInputFile = path.resolve(__dirname, '../src/bis/bis_dp_search_export_20250819-073249.csv');
const greenlandInputFile = path.resolve(__dirname, '../src/bank.stat.gl/PRXPRISF_20250819-073721.csv');
const worldBankInputFile = path.resolve(__dirname, '../src/worldbank/API_FP.CPI.TOTL_DS2_en_csv_v2_37831/API_FP.CPI.TOTL_DS2_en_csv_v2_37831.csv');

// MongoDB setup
const MONGO_URI = `mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASS)}@${process.env.DB_IP}:27017/${process.env.DB_NAME}?authSource=admin`;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = 'inflation';

const client = new MongoClient(MONGO_URI);

const processIMFData = () => {
  return new Promise((resolve, reject) => {
    console.log(pc.blue(`${new Date().toISOString()} - Reading IMF CPI data from CSV...`));
    
    const rawData = {};
    const countryNames = {};
    
    fs.createReadStream(imfInputFile)
      .pipe(csv())
      .on('data', (row) => {
        const seriesCode = row['SERIES_CODE'];
        const match = seriesCode?.match(/^([A-Z]{3})\.CPI/);
        if (!match) return;

        const countryCode = match[1];
        const countryName = row['COUNTRY'];
        
        // Store country name for logging purposes
        if (countryName) {
          countryNames[countryCode] = countryName;
        }

        // Process year columns (like '2015', '2016', etc.)
        Object.keys(row).forEach((key) => {
          if (/^\d{4}$/.test(key) && row[key] && row[key].trim() !== '') {
            if (!rawData[countryCode]) rawData[countryCode] = {};
            rawData[countryCode][key] = parseFloat(row[key]);
          }
        });
      })
      .on('end', () => {
        console.log(pc.blue(`${new Date().toISOString()} - Finished processing IMF data`));
        resolve({ rawData, countryNames });
      })
      .on('error', reject);
  });
};

const processBISData = () => {
  return new Promise((resolve, reject) => {
    console.log(pc.blue(`${new Date().toISOString()} - Reading BIS CPI data from CSV...`));
    
    const rawData = {};
    const countryNames = {};
    
    fs.createReadStream(bisInputFile)
      .pipe(csv())
      .on('data', (row) => {
        const refArea = row['REF_AREA:Reference area'];
        const timePeriod = row['TIME_PERIOD:Period'];
        const obsValue = row['OBS_VALUE:Value'];
        
        if (!refArea || !timePeriod || !obsValue) return;
        
        // Extract country code from REF_AREA (format: "AR:Argentina")
        const areaMatch = refArea.match(/^([A-Z]{2,3}):(.*)/);
        if (!areaMatch) return;
        
        const countryCode = areaMatch[1];
        const countryName = areaMatch[2];
        
        // Convert 2-letter codes to 3-letter codes for consistency
        const COUNTRY_CODE_MAP = {
          'AR': 'ARG',
          'LT': 'LTU', 
          'MK': 'MKD',
          'RU': 'RUS'
        };
        
        const normalizedCountryCode = COUNTRY_CODE_MAP[countryCode] || countryCode;
        
        // Store country name
        if (countryName) {
          countryNames[normalizedCountryCode] = countryName;
        }
        
        // Extract year from TIME_PERIOD (format: "2024-12-31")
        const yearMatch = timePeriod.match(/^(\d{4})-/);
        if (!yearMatch) return;
        
        const year = yearMatch[1];
        
        if (!rawData[normalizedCountryCode]) rawData[normalizedCountryCode] = {};
        rawData[normalizedCountryCode][year] = parseFloat(obsValue);
      })
      .on('end', () => {
        console.log(pc.blue(`${new Date().toISOString()} - Finished processing BIS data`));
        resolve({ rawData, countryNames });
      })
      .on('error', reject);
  });
};

const processGreenlandData = () => {
  return new Promise((resolve, reject) => {
    console.log(pc.blue(`${new Date().toISOString()} - Reading Greenland CPI data from CSV...`));
    
    const rawData = {};
    const countryNames = {};
    
    // Set Greenland country data
    const GREENLAND_COUNTRY_CODE = 'GRL';
    countryNames[GREENLAND_COUNTRY_CODE] = 'Greenland';
    rawData[GREENLAND_COUNTRY_CODE] = {};
    
    fs.createReadStream(greenlandInputFile)
      .pipe(csv())
      .on('data', (row) => {
        const timeString = row['time'];
        const cpiValue = row['Consumer Price Index'];
        
        if (!timeString || !cpiValue) return;
        
        // Extract year from time string (format: "2024 January")
        const yearMatch = timeString.match(/^(\d{4})\s/);
        if (!yearMatch) return;
        
        const year = yearMatch[1];
        const cpiNumber = parseFloat(cpiValue);
        
        if (!isNaN(cpiNumber)) {
          rawData[GREENLAND_COUNTRY_CODE][year] = cpiNumber;
        }
      })
      .on('end', () => {
        console.log(pc.blue(`${new Date().toISOString()} - Finished processing Greenland data`));
        resolve({ rawData, countryNames });
      })
      .on('error', reject);
  });
};

const processWorldBankData = () => {
  return new Promise((resolve, reject) => {
    console.log(pc.blue(`${new Date().toISOString()} - Reading World Bank CPI data from CSV...`));
    
    const rawData = {};
    const countryNames = {}; // Keep empty - we'll rely on other sources for country names
    
    fs.createReadStream(worldBankInputFile)
      .pipe(csv())
      .on('data', (row) => {
        const countryCode = row['Country Code'];
        const indicatorCode = row['Indicator Code'];
        
        // Only process CPI data rows
        if (indicatorCode !== 'FP.CPI.TOTL' || !countryCode) return;
        
        // Skip regional aggregates and groupings (3-letter codes only for individual countries)
        if (countryCode.length !== 3) return;
        
        // Don't store country name - we'll rely on other data sources for that
        
        // Process year columns (from 1960 to 2024)
        Object.keys(row).forEach((key) => {
          if (/^\d{4}$/.test(key) && row[key] && row[key].trim() !== '') {
            const year = parseInt(key);
            const cpiValue = parseFloat(row[key]);
            
            if (!isNaN(cpiValue) && year >= TIME_PERIOD[0] - 1 && year <= TIME_PERIOD[1]) {
              if (!rawData[countryCode]) rawData[countryCode] = {};
              rawData[countryCode][year] = cpiValue;
            }
          }
        });
      })
      .on('end', () => {
        console.log(pc.blue(`${new Date().toISOString()} - Finished processing World Bank data`));
        resolve({ rawData, countryNames });
      })
      .on('error', reject);
  });
};

const processInflationCalculations = (combinedRawData, combinedCountryNames, dataSources) => {
  console.log(pc.blue(`${new Date().toISOString()} - Processing inflation calculations...`));
  
  const inflationData = {};
  const skippedCountries = [];
  
  for (const [country, yearValues] of Object.entries(combinedRawData)) {
    const sortedYears = Object.keys(yearValues).map(Number).sort((a, b) => a - b);
    
    // Check which years are available in the time period
    const requiredYears = [];
    for (let year = TIME_PERIOD[0] - 1; year <= TIME_PERIOD[1]; year++) {
      requiredYears.push(year);
    }
    
    const availableYears = sortedYears.filter(year => 
      year >= TIME_PERIOD[0] - 1 && year <= TIME_PERIOD[1]
    );
    
    const missingYears = requiredYears.filter(year => !availableYears.includes(year));
    
    // Only skip countries with NO data at all in the time period
    if (availableYears.length === 0) {
      skippedCountries.push({
        country,
        countryName: combinedCountryNames[country] || country,
        reason: 'No data available for any year in the time period',
        missingYears: requiredYears
      });
      continue;
    }
    
    const yoyInflation = {};
    const skippedYears = [];
    let sumLast10 = 0;
    let countLast10 = 0;

    for (let i = 1; i < sortedYears.length; i++) {
      const year = sortedYears[i];
      const prevYear = sortedYears[i - 1];

      const prev = yearValues[prevYear];
      const curr = yearValues[year];

      if (prev && curr) {
        const change = ((curr - prev) / prev) * 100;

        if (year >= (TIME_PERIOD[0] - 1) && year <= TIME_PERIOD[1]) {
          sumLast10 += change;
          countLast10++;
        }

        if (year > (TIME_PERIOD[0] - 1) && year <= TIME_PERIOD[1]) {
          yoyInflation[year] = change;
        } 
      } else {
        // Track years where inflation couldn't be calculated due to missing data
        if (year > (TIME_PERIOD[0] - 1) && year <= TIME_PERIOD[1]) {
          skippedYears.push(year);
        }
      }
    }

    // Add any completely missing years to skipped years
    missingYears.forEach(year => {
      if (year > TIME_PERIOD[0] - 1 && year <= TIME_PERIOD[1] && !skippedYears.includes(year)) {
        skippedYears.push(year);
      }
    });

    // Build the country data object
    const countryData = {
      avg_inflation_last_10_years: countLast10 > 0 ? sumLast10 / countLast10 : null,
      yoy_inflation: yoyInflation,
      data_source: dataSources[country] || 'World Bank'
    };

    // Only include skipped_years if there are actual skipped years
    if (skippedYears.length > 0) {
      countryData.skipped_years = skippedYears.sort((a, b) => a - b);
    }

    inflationData[country] = countryData;
  }

  return { inflationData, skippedCountries };
};

const saveToDatabase = async (inflationData) => {
  try {
    await client.connect();
    console.log(pc.blue(`${new Date().toISOString()} - Connecting to MongoDB...`));
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.deleteMany({});

    const docs = Object.entries(inflationData).map(([country, data]) => ({
      _id: country,
      ...data
    }));

    await collection.insertMany(docs);
    console.log(pc.green(`${new Date().toISOString()} - ✅ Inserted ${docs.length} documents into '${COLLECTION_NAME}'`));
  } catch (err) {
    console.error(pc.red(`${new Date().toISOString()} - ❌ MongoDB error:`), err);
    throw err;
  } finally {
    await client.close();
    console.log(pc.blue(`${new Date().toISOString()} - MongoDB connection closed`));
  }
};

const processData = async () => {
  try {
    // Process all data sources
    const [imfResult, bisResult, greenlandResult, worldBankResult] = await Promise.all([
      processIMFData(),
      processBISData(),
      processGreenlandData(),
      processWorldBankData()
    ]);
    
    // Combine data from all sources (later sources will override earlier ones for the same countries)
    const combinedRawData = { 
      ...worldBankResult.rawData,
      ...imfResult.rawData, 
      ...bisResult.rawData, 
      ...greenlandResult.rawData 
    };
    const combinedCountryNames = { 
      ...worldBankResult.countryNames,
      ...imfResult.countryNames, 
      ...bisResult.countryNames, 
      ...greenlandResult.countryNames 
    };
    
    // Track data sources for each country
    const dataSources = {};
    
    // Assign data sources based on priority (last one wins)
    Object.keys(worldBankResult.rawData).forEach(country => {
      dataSources[country] = 'World Bank';
    });
    Object.keys(imfResult.rawData).forEach(country => {
      dataSources[country] = 'IMF';
    });
    Object.keys(bisResult.rawData).forEach(country => {
      dataSources[country] = 'BIS';
    });
    Object.keys(greenlandResult.rawData).forEach(country => {
      dataSources[country] = 'Bank of Greenland';
    });
    
    // Process inflation calculations
    const { inflationData, skippedCountries } = processInflationCalculations(combinedRawData, combinedCountryNames, dataSources);
    
    // Log skipped countries
    if (skippedCountries.length > 0) {
      console.log(pc.yellow(`\n⚠️  Skipped ${skippedCountries.length} countries due to missing CPI data:`));
      skippedCountries.forEach(({ countryName, missingYears }) => {
        console.log(pc.yellow(`  - ${countryName}: Missing years ${missingYears.join(', ')}`));
      });
    }

    console.log(pc.green(`\n✅ Processing ${Object.keys(inflationData).length} countries with complete data`));

    // Save to database
    await saveToDatabase(inflationData);
    
  } catch (err) {
    console.error(pc.red(`${new Date().toISOString()} - ❌ Error during processing:`), err);
  }
};

processData();
