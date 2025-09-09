import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pc from 'picocolors';
import { simplify } from '@turf/simplify';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Country from '../../models/Country.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATAHUB_DIR = path.join(__dirname, '../src/datahub');
const MISC_DIR = path.join(__dirname, '../src/misc');
const COUNTRIES_FILE = path.join(DATAHUB_DIR, 'countries.geojson');
const COUNTRIES_EXTENDED_FILE = path.join(MISC_DIR, 'countries_extended.geojson');
const POPULATION_FILE = path.join(DATAHUB_DIR, 'population.json');
const CURRENCIES_FILE = path.join(DATAHUB_DIR, 'currencies.json');
const WITHDRAWN_CURRENCIES_FILE = path.join(DATAHUB_DIR, 'withdrawn-currencies.json');

// MongoDB connection string - use environment variable with proper authentication
const MONGODB_URI = `mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASS)}@${process.env.DB_IP}:27017/${process.env.DB_NAME}?authSource=admin`;

async function processCountries() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(pc.blue(`${new Date().toISOString()} - Connected to MongoDB`));

    console.log(pc.blue(`${new Date().toISOString()} - Starting countries processing...`));
    
    // Read the countries data
    const countriesData = JSON.parse(await fs.readFile(COUNTRIES_FILE, 'utf8'));
    
    console.log(pc.blue(`${new Date().toISOString()} - Loading extended countries data for ISO code lookup...`));
    // Read the extended countries data for ISO code lookup
    const extendedCountriesData = JSON.parse(await fs.readFile(COUNTRIES_EXTENDED_FILE, 'utf8'));
    
    // Create a map for quick lookup of ISO codes by country name
    const countryNameToISOMap = new Map();
    extendedCountriesData.features.forEach(feature => {
      const nameEn = feature.properties.name_en;
      const isoA2 = feature.properties.iso_a2_eh;
      const isoA3 = feature.properties.iso_a3_eh;
      
      if (nameEn && isoA2 && isoA3 && isoA2 !== '-99' && isoA3 !== '-99') {
        countryNameToISOMap.set(nameEn, {
          iso_a2: isoA2,
          iso_a3: isoA3
        });
      }
    });
    
    console.log(pc.blue(`${new Date().toISOString()} - Loading population data...`));
    // Read the population data
    const populationData = JSON.parse(await fs.readFile(POPULATION_FILE, 'utf8'));
    
    // Create a map of country code to latest population data
    const countryPopulationMap = new Map();
    
    // Group population data by country code and find the latest year
    populationData.forEach(entry => {
      const countryCode = entry['Country Code'];
      const year = entry.Year;
      const population = entry.Value;
      const countryName = entry['Country Name'];
      
      if (!countryPopulationMap.has(countryCode)) {
        countryPopulationMap.set(countryCode, {
          name: countryName,
          latestYear: year,
          population: population
        });
      } else {
        const existing = countryPopulationMap.get(countryCode);
        if (year > existing.latestYear) {
          existing.latestYear = year;
          existing.population = population;
        }
      }
    });
    
    console.log(pc.blue(`${new Date().toISOString()} - Processed population data for ${countryPopulationMap.size} countries`));
    
    console.log(pc.blue(`${new Date().toISOString()} - Loading currencies data...`));
    // Read the currencies data
    const currenciesData = JSON.parse(await fs.readFile(CURRENCIES_FILE, 'utf8'));
    
    // Create a map for quick lookup of currency by entity name (normalized to uppercase)
    const entityToCurrencyMap = new Map();
    currenciesData.forEach(currencyEntry => {
      const entity = currencyEntry.Entity?.toUpperCase();
      const currency = currencyEntry.Currency;
      const currencyCode = currencyEntry.AlphabeticCode;
      
      if (entity && currency) {
        entityToCurrencyMap.set(entity, {
          currency,
          currencyCode
        });
      }
    });
    
    console.log(pc.blue(`${new Date().toISOString()} - Processed currency data for ${entityToCurrencyMap.size} entities`));
    
    // Read withdrawn currencies data
    const withdrawnCurrenciesData = JSON.parse(await fs.readFile(WITHDRAWN_CURRENCIES_FILE, 'utf8'));
    
    // Create a map for quick lookup of withdrawn currency by entity (uppercase)
    const withdrawnCurrencyMap = new Map();
    if (withdrawnCurrenciesData.currencies) {
      withdrawnCurrenciesData.currencies.forEach(entry => {
        if (entry.entity) {
          withdrawnCurrencyMap.set(entry.entity.toUpperCase(), entry);
        }
      });
    }
    
    console.log(pc.blue(`${new Date().toISOString()} - Processed ${withdrawnCurrencyMap.size} withdrawn currencies`));
    
    const countriesWithoutPopulation = [];
    const countriesWithoutCurrency = [];
    let countriesWithPopulation = 0;
    let countriesWithCurrency = 0;
    let isoCodesFixed = 0;
    
    // Process each country feature
    countriesData.features.forEach((feature) => {
      const countryName = feature.properties.name || 'Unknown';
      
      // Handle ISO codes - check for -99 values and lookup from extended data
      let isoA2 = feature.properties['ISO3166-1-Alpha-2'];
      let isoA3 = feature.properties['ISO3166-1-Alpha-3'];
      
      if (isoA2 === '-99' || isoA3 === '-99') {
        const extendedData = countryNameToISOMap.get(countryName);
        if (extendedData) {
          if (isoA2 === '-99') {
            isoA2 = extendedData.iso_a2;
          }
          if (isoA3 === '-99') {
            isoA3 = extendedData.iso_a3;
          }
          isoCodesFixed++;
          console.log(pc.cyan(`Fixed ISO codes for ${countryName}: ${isoA2}/${isoA3}`));
        } else {
          console.log(pc.yellow(`Could not find ISO codes for ${countryName} in extended data`));
        }
      }
      
      // Convert property names to lowercase with underscores
      feature.properties.iso_a2 = isoA2;
      feature.properties.iso_a3 = isoA3;
      
      // Remove the old property names
      delete feature.properties['ISO3166-1-Alpha-2'];
      delete feature.properties['ISO3166-1-Alpha-3'];
      
      // Try to find currency data using country name
      const normalizedCountryName = countryName.toUpperCase();
      
      if (entityToCurrencyMap.has(normalizedCountryName)) {
        const currencyData = entityToCurrencyMap.get(normalizedCountryName);
        feature.properties.currency = currencyData.currency;
        feature.properties.currencyCode = currencyData.currencyCode;
        countriesWithCurrency++;
      } else {
        feature.properties.currency = null;
        feature.properties.currencyCode = null;
        countriesWithoutCurrency.push({
          name: countryName,
          normalizedName: normalizedCountryName
        });
      }
      
      // Try to find population data using ISO3 code
      const iso3Code = feature.properties.iso_a3;
      
      if (iso3Code && iso3Code !== '-99' && countryPopulationMap.has(iso3Code)) {
        const popData = countryPopulationMap.get(iso3Code);
        feature.properties.population = popData.population;
        feature.properties.populationYear = popData.latestYear;
        countriesWithPopulation++;
      } else {
        feature.properties.population = null;
        feature.properties.populationYear = null;
        countriesWithoutPopulation.push({
          name: countryName,
          iso3: iso3Code || 'No ISO3 code'
        });
      }
      
      // Add withdrawn currency info if available
      const withdrawn = withdrawnCurrencyMap.get(normalizedCountryName);
      if (withdrawn) {
        feature.properties.withdrawnCurrency = withdrawn.currency ?? null;
        feature.properties.withdrawnCurrencyCode = withdrawn.alphabeticCode ?? null;
        feature.properties.withdrawnCurrencyDate = withdrawn.withdrawalDate ?? null;
      } else {
        feature.properties.withdrawnCurrency = null;
        feature.properties.withdrawnCurrencyCode = null;
        feature.properties.withdrawnCurrencyDate = null;
      }
    });
    
    // Log summary
    console.log(pc.green(`\n✓ Successfully matched ${countriesWithPopulation} countries with population data`));
    console.log(pc.green(`✓ Successfully matched ${countriesWithCurrency} countries with currency data`));
    console.log(pc.green(`✓ Fixed ISO codes for ${isoCodesFixed} countries using extended data`));
    
    // Log countries without population data
    if (countriesWithoutPopulation.length > 0) {
      console.log(pc.yellow(`\n⚠️  Countries without population data (${countriesWithoutPopulation.length}):`));
      countriesWithoutPopulation.forEach(country => {
        console.log(`  - ${country.name} (ISO3: ${country.iso3})`);
      });
    }
    
    // Log countries without currency data
    if (countriesWithoutCurrency.length > 0) {
      console.log(pc.yellow(`\n⚠️  Countries without currency data (${countriesWithoutCurrency.length}):`));
      countriesWithoutCurrency.forEach(country => {
        console.log(`  - ${country.name} (normalized: ${country.normalizedName})`);
      });
    }
    
    // Simplify geometries to reduce file size
    console.log(pc.blue(`\n${new Date().toISOString()} - Simplifying geometries to reduce file size...`));
    const originalSize = JSON.stringify(countriesData).length;
    
    // Simplify each feature's geometry
    countriesData.features = countriesData.features.map(feature => {
      try {
        // Use a tolerance of 0.03 degrees for good balance between size and quality
        const simplified = simplify(feature, { tolerance: 0.03, highQuality: false });
        return simplified;
      } catch (error) {
        console.log(pc.yellow(`Warning: Could not simplify geometry for ${feature.properties.name}, keeping original`));
        return feature;
      }
    });
    
    const simplifiedSize = JSON.stringify(countriesData).length;
    const reductionPercent = ((originalSize - simplifiedSize) / originalSize * 100).toFixed(1);
    console.log(pc.green(`Geometry simplification complete: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(simplifiedSize / 1024 / 1024).toFixed(1)}MB (${reductionPercent}% reduction)`));
    
    // Clear existing data and write to MongoDB
    console.log(pc.blue(`${new Date().toISOString()} - Writing countries data to MongoDB...`));
    await Country.deleteMany({});
    
    const countryDocuments = countriesData.features.map(feature => ({
      type: feature.type,
      properties: feature.properties,
      geometry: feature.geometry
    }));
    
    await Country.insertMany(countryDocuments);
    
    console.log(pc.green(`${new Date().toISOString()} - Successfully written ${countryDocuments.length} countries to MongoDB`));
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log(pc.blue(`${new Date().toISOString()} - Disconnected from MongoDB`));
    
  } catch (error) {
    console.error(pc.red(`${new Date().toISOString()} - Error processing countries:`), error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// Alternative approach if you have a mapping file or API
async function processCountriesWithMapping() {
  // This would be used if we had a proper mapping between country names and population data
  // For now, we'll use the simpler approach above
}

// Run the script
processCountries();
