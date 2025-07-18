const setInitialized = (initialized) => ({
  type: 'SET_INITIALIZED',
  payload: initialized,
});

const setCountries = (countries) => ({
  type: 'SET_COUNTRIES',
  payload: countries,
});

const setInflationData = (inflationData) => ({
  type: 'SET_INFLATION_DATA',
  payload: inflationData,
});

export {
  setInitialized,
  setCountries,
  setInflationData,
};
