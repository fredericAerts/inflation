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

const setGoldMonthlyPrice = (data) => ({
  type: 'SET_GOLD_MONTHLY_PRICE',
  payload: data,
});

const setBitcoinMonthlyPrice = (data) => ({
  type: 'SET_BITCOIN_MONTHLY_PRICE',
  payload: data,
});

export {
  setInitialized,
  setCountries,
  setInflationData,
  setGoldMonthlyPrice,
  setBitcoinMonthlyPrice,
};
