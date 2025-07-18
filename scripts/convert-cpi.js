import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

const TIME_PERIOD = [2015, 2024]; // last 10 years

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.resolve(__dirname, '../server/data/imf/dataset_2025-07-18T04_21_18.063503982Z_DEFAULT_INTEGRATION_IMF.STA_CPI_4.0.0.csv');

// MongoDB setup
const MONGO_URI = `mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASS)}@${process.env.DB_IP}:27017/${process.env.DB_NAME}?authSource=admin`;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = 'inflation';

const client = new MongoClient(MONGO_URI);

const rawData = {};

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    const seriesCode = row['SERIES_CODE'];
    const match = seriesCode.match(/^([A-Z]{3})\.CPI/);
    if (!match) return;

    const countryCode = match[1];
    if (!rawData[countryCode]) rawData[countryCode] = {};

    Object.keys(row).forEach((key) => {
      if (/^\d{4}$/.test(key) && row[key]) {
        rawData[countryCode][key] = parseFloat(row[key]);
      }
    });
  })
  .on('end', async () => {
    const inflationData = {};
    /**
     * Added missing data for Argentina
     * https://data.bis.org/topics/CPI/BIS%2CWS_LONG_CPI%2C1.0/A.AR.628?view=observations
     */
    rawData['ARG'] = {
      '2014': 162.170,
      '2015': 188.236,
      '2016': 249.072,
      '2017': 310.827,
      '2018': 416.975,
      '2019': 637.156,
      '2020': 895.092,
      '2021': 1316.691,
      '2022': 2279.525,
      '2023': 5335.092,
      '2024': 17232.226
    }
    for (const [country, yearValues] of Object.entries(rawData)) {
      const sortedYears = Object.keys(yearValues).map(Number).sort((a, b) => a - b);
      const yoyInflation = {};
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
        }
      }

      inflationData[country] = {
        avg_inflation_last_10_years: countLast10 > 0 ? sumLast10 / countLast10 : null,
        yoy_inflation: yoyInflation
      };
    }

    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);

      await collection.deleteMany({});

      const docs = Object.entries(inflationData).map(([country, data]) => ({
        _id: country,
        ...data
      }));

      await collection.insertMany(docs);
      console.log(`✅ Inserted ${docs.length} documents into '${COLLECTION_NAME}'`);
    } catch (err) {
      console.error('❌ MongoDB error:', err);
    } finally {
      await client.close();
    }
  });
