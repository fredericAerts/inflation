const defaultState = {
  initialized: false,
  countries: null,
  inflationData: null,
  gold_monthly_price: null,
  bitcoin_monthly_price: null,
};

function asyncState(state = defaultState, action) {
  switch (action.type) {
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'SET_COUNTRIES':
      return { ...state, countries: action.payload };
    case 'SET_INFLATION_DATA':
      return { ...state, inflationData: action.payload };
    case 'SET_GOLD_MONTHLY_PRICE':
      return { ...state, gold_monthly_price: action.payload };
    case 'SET_BITCOIN_MONTHLY_PRICE':
      return { ...state, bitcoin_monthly_price: action.payload };
    default:
      return state;
  }
}

export default asyncState;
