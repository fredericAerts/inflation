import { fetchCountriesJson } from '../../services/data.service.js';
import { fetchInflationData } from '../../services/inflation.db.service.js';
import { fetchMetrics } from '../../services/metrics.db.service.js';

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

  return {
    getCountries,
    getInflationData,
    getMetrics,
  };
};

export default dataController;