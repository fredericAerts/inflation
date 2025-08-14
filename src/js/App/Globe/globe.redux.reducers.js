import { 
  SET_SELECTED_COUNTRY_ID, 
  CLEAR_SELECTED_COUNTRY_ID, 
  SET_COUNTRY_MODAL_DATA,
  SET_MAP_INSTANCE
} from './globe.redux.actions';

const INITIAL_STATE = {
  selectedCountryId: null,
  modalData: null,
  map: null,
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
    case SET_MAP_INSTANCE:
      return {
        ...state,
        map: action.payload,
      };
    default:
      return state;
  }
};

export default globeState;