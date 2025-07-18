import { fetchCountriesJson } from '../../services/data.service.js';
import { fetchInflationData } from '../../services/inflation.db.service.js';

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

  return {
    getCountries,
    getInflationData,
  };
};

export default dataController;