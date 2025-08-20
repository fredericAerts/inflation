import CurrencyPerformance from '../models/CurrencyPerformance.model.js';

const fetchCurrencyPerformance = async (currencyCode) => {
  try {
    const currencyData = await CurrencyPerformance.findById(currencyCode);
    return currencyData;
  } catch (error) {
    console.error(`Error fetching currency performance for ${currencyCode}:`, error);
    throw error;
  }
};

const fetchMultipleCurrencyPerformance = async (currencyCodes) => {
  try {
    const currencyData = await CurrencyPerformance.find({
      _id: { $in: currencyCodes }
    });
    return currencyData;
  } catch (error) {
    console.error('Error fetching multiple currency performance data:', error);
    throw error;
  }
};

export {
  fetchCurrencyPerformance,
  fetchMultipleCurrencyPerformance,
}