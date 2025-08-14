import { SET_ABOUT_MODAL_OPEN, SET_ABOUT_MODAL_SECTION } from './navMenu.redux.actions';

const INITIAL_STATE = {
  isAboutModalOpen: false,
  activeSection: 'story',
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
      };

    default:
      return state;
  }
};

export default navMenuReducer;
