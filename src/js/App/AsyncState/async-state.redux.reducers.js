const defaultState = {
  initialized: false,
  countries: undefined,
  inflationData: undefined,
  usd_per_xau: undefined,
  btc_per_xau: undefined,
  all_fiat_per_xau: undefined,
};

function asyncState(state = defaultState, action) {
  switch (action.type) {
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'SET_COUNTRIES':
      return { ...state, countries: action.payload };
    case 'SET_INFLATION_DATA':
      return { ...state, inflationData: action.payload };
    case 'SET_USD_PER_XAU':
      return { ...state, usd_per_xau: action.payload };
    case 'SET_BTC_PER_XAU':
      return { ...state, btc_per_xau: action.payload };
    case 'SET_ALL_FIAT_PER_XAU':
      return { ...state, all_fiat_per_xau: action.payload };
    default:
      return state;
  }
}

export default asyncState;
