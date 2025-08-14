import { SET_ABOUT_MODAL_OPEN, SET_ABOUT_MODAL_SECTION, SET_MAP_COVERING_BANNER } from './navMenu.redux.actions';

const INITIAL_STATE = {
  isAboutModalOpen: false,
  activeSection: 'home',
  shouldResetMap: false,
  isMapCoveringBanner: false,
};

const navMenuReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_ABOUT_MODAL_OPEN:
      return {
        ...state,
        isAboutModalOpen: action.payload,
      };

    case SET_ABOUT_MODAL_SECTION:
      return {
        ...state,
        activeSection: action.payload,
        shouldResetMap: action.payload === 'home',
      };

    case SET_MAP_COVERING_BANNER:
      return {
        ...state,
        isMapCoveringBanner: action.payload,
      };

    default:
      return state;
  }
};

export default navMenuReducer;
