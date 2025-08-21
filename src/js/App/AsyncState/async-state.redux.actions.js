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

const setUsdPerXau = (data) => ({
  type: 'SET_USD_PER_XAU',
  payload: data,
});

const setBtcPerXau = (data) => ({
  type: 'SET_BTC_PER_XAU',
  payload: data,
});

export {
  setInitialized,
  setCountries,
  setInflationData,
  setUsdPerXau,
  setBtcPerXau,
};
