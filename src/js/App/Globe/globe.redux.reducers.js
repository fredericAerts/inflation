import { 
  SET_SELECTED_COUNTRY_ID, 
  CLEAR_SELECTED_COUNTRY_ID, 
  SET_COUNTRY_MODAL_DATA 
} from './globe.redux.actions';

const INITIAL_STATE = {
  selectedCountryId: null,
  modalData: null,
};

const globeState = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_SELECTED_COUNTRY_ID:
      return {
        ...state,
        selectedCountryId: action.payload,
      };
    case CLEAR_SELECTED_COUNTRY_ID:
      return {
        ...state,
        selectedCountryId: null,
        modalData: null,
      };
    case SET_COUNTRY_MODAL_DATA:
      return {
        ...state,
        modalData: action.payload,
      };
    default:
      return state;
  }
};

export default globeState;