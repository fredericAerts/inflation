import { promises as fs } from 'fs';
import path from 'path';
import Country from '../models/Country.model.js';

async function fetchCountryData() {
  try {
    const countries = await Country.find({});
    
    return {
      type: 'FeatureCollection',
      features: countries.map(doc => ({
        type: doc.type,
        properties: doc.properties,
        geometry: doc.geometry
      }))
    };
  } catch (error) {
    console.error('[fetchCountryData] Failed to read countries from MongoDB:', error);
    throw error;
  }
}

export {
  fetchCountryData
};