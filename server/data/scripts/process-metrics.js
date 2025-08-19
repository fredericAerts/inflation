import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import pc from 'picocolors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catoInputFile = path.resolve(__dirname, '../src/cato/human-freedom-index-data-2024.csv');
const imfInputFile = path.resolve(__dirname, '../src/imf/imf-dm-export-20250819.csv');
const countriesFile = path.resolve(__dirname, '../countries.json');

// MongoDB setup
const MONGO_URI = `mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASS)}@${process.env.DB_IP}:27017/${process.env.DB_NAME}?authSource=admin`;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = 'metrics';

const client = new MongoClient(MONGO_URI);

// Create country name to ISO3 mapping from countries.json
const createCountryMapping = () => {
  try {
    console.log(pc.blue(`${new Date().toISOString()} - Loading country mapping from countries.json...`));
    const countriesData = JSON.parse(fs.readFileSync(countriesFile, 'utf8'));
    
    const nameToIso3Map = new Map();
    
    countriesData.features.forEach(feature => {
      const name = feature.properties.name;
      const iso3 = feature.properties.iso_a3;
      
      if (name && iso3 && iso3 !== '-99') {
        nameToIso3Map.set(name.toLowerCase(), iso3);
        
        // Add some common alternative names for better matching
        const alternativeNames = getAlternativeNames(name);
        alternativeNames.forEach(altName => {
          nameToIso3Map.set(altName.toLowerCase(), iso3);
        });
      }
    });
    
    console.log(pc.blue(`${new Date().toISOString()} - Created mapping for ${nameToIso3Map.size} country names/aliases`));
    return nameToIso3Map;
  } catch (error) {
    console.error(pc.red(`${new Date().toISOString()} - Error loading countries.json:`), error);
    throw error;
  }
};

// Add alternative names for better matching with IMF data
const getAlternativeNames = (name) => {
  const alternatives = [];
  
  const nameMapping = {
    'United States of America': ['United States'],
    'United Kingdom': ['United Kingdom of Great Britain and Northern Ireland'],
    'South Korea': ['Korea, Republic of'],
    'North Korea': ['Korea, Dem. People\'s Rep. of'],
    'Russia': ['Russian Federation'],
    'Iran': ['Iran, Islamic Rep. of'],
    'Egypt': ['Egypt, Arab Rep. of'],
    'Venezuela': ['Venezuela, RB'],
    'Syria': ['Syrian Arab Republic'],
    'Laos': ['Lao P.D.R.'],
    'North Macedonia': ['Macedonia, FYR'],
    'Republic of the Congo': ['Congo, Rep.'],
    'Democratic Republic of the Congo': ['Congo, Dem. Rep.'],
    'Ivory Coast': ['Côte d\'Ivoire'],
    'Czechia': ['Czech Republic'],
    'eSwatini': ['Swaziland'],
    'East Timor': ['Timor-Leste'],
    'Myanmar': ['Burma'],
    'The Bahamas': ['Bahamas'],
    'Gambia': ['Gambia, The'],
    'Cape Verde': ['Cabo Verde'],
    'Yemen': ['Yemen, Rep.'],
    'Slovakia': ['Slovak Republic'],
    'Kyrgyzstan': ['Kyrgyz Republic'],
  };
  
  if (nameMapping[name]) {
    alternatives.push(...nameMapping[name]);
  }
  
  return alternatives;
};

const processCatoData = () => {
  return new Promise((resolve, reject) => {
    console.log(pc.blue(`${new Date().toISOString()} - Reading Cato Freedom Index data from CSV...`));
    
    const metricsData = {};
    
    fs.createReadStream(catoInputFile)
      .pipe(csv())
      .on('data', (row) => {
        const year = row['year'];
        const iso = row['iso'];
        const hfScore = row['hf_score'];
        
        // Only process 2022 data (most recent complete year)
        if (year !== '2022' || !iso || !hfScore) return;
        
        const freedomIndex = parseFloat(hfScore);
        
        if (!isNaN(freedomIndex)) {
          metricsData[iso] = {
            freedom_index: freedomIndex
          };
        }
      })
      .on('end', () => {
        console.log(pc.blue(`${new Date().toISOString()} - Finished processing Cato data`));
        resolve(metricsData);
      })
      .on('error', reject);
  });
};

const processImfData = (nameToIso3Map) => {
  return new Promise((resolve, reject) => {
    console.log(pc.blue(`${new Date().toISOString()} - Reading IMF government debt data from CSV...`));
    
    const govDebtData = {};
    let matchedCount = 0;
    let unmatchedCountries = [];
    
    fs.createReadStream(imfInputFile)
      .pipe(csv({ separator: ';' })) // IMF file uses semicolon separator
      .on('data', (row) => {
        const countryName = row['Country'];
        const debt2024 = row['2024'];
        
        if (!countryName || !debt2024 || debt2024 === 'no data') return;
        
        const debtValue = parseFloat(debt2024.replace(',', '.'));
        if (isNaN(debtValue)) return;
        
        // Try to find ISO3 code for this country
        const iso3 = nameToIso3Map.get(countryName.toLowerCase());
        
        if (iso3) {
          govDebtData[iso3] = {
            gov_dept_per_gdp: debtValue
          };
          matchedCount++;
        } else {
          unmatchedCountries.push(countryName);
        }
      })
      .on('end', () => {
        console.log(pc.blue(`${new Date().toISOString()} - Finished processing IMF data`));
        console.log(pc.green(`✅ Matched ${matchedCount} countries with government debt data`));
        
        if (unmatchedCountries.length > 0) {
          console.log(pc.yellow(`⚠️  Could not match ${unmatchedCountries.length} countries:`));
          unmatchedCountries.slice(0, 10).forEach(country => {
            console.log(`  - ${country}`);
          });
          if (unmatchedCountries.length > 10) {
            console.log(pc.yellow(`  ... and ${unmatchedCountries.length - 10} more`));
          }
        }
        
        resolve(govDebtData);
      })
      .on('error', reject);
  });
};

const saveToDatabase = async (metricsData) => {
  try {
    await client.connect();
    console.log(pc.blue(`${new Date().toISOString()} - Connecting to MongoDB...`));
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.deleteMany({});

    const docs = Object.entries(metricsData).map(([country, data]) => ({
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
    // Create country name to ISO3 mapping
    const nameToIso3Map = createCountryMapping();
    
    // Process Cato Freedom Index data
    const freedomData = await processCatoData();
    
    // Process IMF government debt data
    const govDebtData = await processImfData(nameToIso3Map);
    
    // Merge the data
    const metricsData = {};
    
    // Add freedom index data
    Object.entries(freedomData).forEach(([iso3, data]) => {
      if (!metricsData[iso3]) metricsData[iso3] = {};
      Object.assign(metricsData[iso3], data);
    });
    
    // Add government debt data
    Object.entries(govDebtData).forEach(([iso3, data]) => {
      if (!metricsData[iso3]) metricsData[iso3] = {};
      Object.assign(metricsData[iso3], data);
    });
    
    console.log(pc.green(`\n✅ Processing ${Object.keys(metricsData).length} countries with combined metrics data`));
    
    // Log summary of data availability
    let freedomCount = 0;
    let debtCount = 0;
    let bothCount = 0;
    
    Object.values(metricsData).forEach(data => {
      if (data.freedom_index !== undefined) freedomCount++;
      if (data.gov_dept_per_gdp !== undefined) debtCount++;
      if (data.freedom_index !== undefined && data.gov_dept_per_gdp !== undefined) bothCount++;
    });
    
    console.log(pc.blue(`📊 Data summary:`));
    console.log(pc.blue(`   - Countries with freedom index: ${freedomCount}`));
    console.log(pc.blue(`   - Countries with government debt: ${debtCount}`));
    console.log(pc.blue(`   - Countries with both metrics: ${bothCount}`));

    // Save to database
    await saveToDatabase(metricsData);
    
  } catch (err) {
    console.error(pc.red(`${new Date().toISOString()} - ❌ Error during processing:`), err);
  }
};

processData();
