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
    let query = {};
    
    // If currencyCodes is null or undefined, fetch all currencies
    if (currencyCodes && currencyCodes.length > 0) {
      query = { _id: { $in: currencyCodes } };
    }
    
    const currencies = await CurrencyPerformance.find(query);
    return currencies;
  } catch (error) {
    console.error('Error fetching multiple currency performance data:', error);
    throw error;
  }
};

export {
  fetchCurrencyPerformance,
  fetchMultipleCurrencyPerformance,
}