const defaultState = {
  initialized: false,
  countries: null,
  inflationData: null,
};

function asyncState(state = defaultState, action) {
  switch (action.type) {
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'SET_COUNTRIES':
      return { ...state, countries: action.payload };
    case 'SET_INFLATION_DATA':
      return { ...state, inflationData: action.payload };
    default:
      return state;
  }
}

export default asyncState;
