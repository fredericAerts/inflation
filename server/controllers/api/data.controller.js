import { fetchCountriesJson } from '../../services/data.service.js';
import { fetchInflationData } from '../../services/inflation.db.service.js';
import { fetchMetrics } from '../../services/metrics.db.service.js';
import { fetchCurrencyPerformance, fetchMultipleCurrencyPerformance } from '../../services/currency-performance.db.service.js';

const dataController = () => {
  const getCountries = (_, res) => {
    fetchCountriesJson()
      .then((countries) => {
        if (!countries) {
          throw new Error('Something went wrong!');
        }

        return res.json(countries);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong!' })
      });
  };

  const getInflationData = (_, res) => {
    fetchInflationData()
      .then((data) => {
        if (!data) {
          throw new Error('Something went wrong!');
        }

        return res.json(data);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong!' })
      });
  };

  const getMetrics = async (req, res) => {
    try {
      const { iso3 } = req.params;
      
      if (!iso3) {
        return res.status(400).json({ error: 'ISO3 country code is required' });
      }

      const metrics = await fetchMetrics(iso3);
      
      if (!metrics) {
        return res.status(404).json({ error: 'Metrics not found for this country' });
      }

      res.json(metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const getCurrencyPerformance = async (req, res) => {
    try {
      const { currencyCode } = req.params;
      
      const currencyData = await fetchCurrencyPerformance(currencyCode);
      
      if (!currencyData) {
        return res.status(404).json({ 
          error: `Currency performance data not found for ${currencyCode}` 
        });
      }
      
      res.json(currencyData);
    } catch (error) {
      console.error(`Error fetching currency performance for ${req.params.currencyCode}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const getMultipleCurrencyPerformance = async (req, res) => {
    try {
      const { currencies } = req.query; // Expected format: "GOLD,BTC"
      
      if (!currencies) {
        return res.status(400).json({ error: 'currencies query parameter is required' });
      }
      
      const currencyCodes = currencies.split(',').map(code => code.trim());
      
      const currencyData = await fetchMultipleCurrencyPerformance(currencyCodes);
      
      res.json(currencyData);
    } catch (error) {
      console.error('Error fetching multiple currency performance data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  return {
    getCountries,
    getInflationData,
    getMetrics,
    getCurrencyPerformance,
    getMultipleCurrencyPerformance,
  };
};

export default dataController;