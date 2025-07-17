import { fetchCountriesJson } from '../../services/data.service.js';

const dataController = () => {
  const getCountries = (_, res) => {
    fetchCountriesJson()
      .then((countries) => {
        if (!countries) {
          throw new Error('Something went wrong!');
        }

        const enrichedCountries = {
          ...countries,
          features: countries.features.map((feature) => {
            const inflation = feature.properties.iso_a2 === 'AQ' ? null : Math.random() * 20;
            
            return {
              ...feature,
              properties: {
                ...feature.properties,
                inflation,
              }
            };
          })
        };

        return res.json(enrichedCountries);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong!' })
      });
  };

  return {
    getCountries,
  };
};

export default dataController;