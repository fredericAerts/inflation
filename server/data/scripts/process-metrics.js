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

// MongoDB setup
const MONGO_URI = `mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASS)}@${process.env.DB_IP}:27017/${process.env.DB_NAME}?authSource=admin`;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = 'metrics';

const client = new MongoClient(MONGO_URI);

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
    // Process Cato Freedom Index data
    const metricsData = await processCatoData();
    
    console.log(pc.green(`\n✅ Processing ${Object.keys(metricsData).length} countries with freedom index data`));

    // Save to database
    await saveToDatabase(metricsData);
    
  } catch (err) {
    console.error(pc.red(`${new Date().toISOString()} - ❌ Error during processing:`), err);
  }
};

processData();
