import Metrics from '../models/Metrics.model.js';

const fetchMetrics = async (iso3Code) => {
  try {
    const metrics = await Metrics.findById(iso3Code).lean();
    return metrics;
  } catch (error) {
    console.error(`Error fetching metrics for ${iso3Code}:`, error);
    throw error;
  }
};

export { fetchMetrics };
