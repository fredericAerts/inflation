export const SET_ABOUT_MODAL_OPEN = 'SET_ABOUT_MODAL_OPEN';
export const SET_ABOUT_MODAL_SECTION = 'SET_ABOUT_MODAL_SECTION';

export const setAboutModalOpen = (isOpen) => ({
  type: SET_ABOUT_MODAL_OPEN,
  payload: isOpen,
});

export const setAboutModalSection = (section) => ({
  type: SET_ABOUT_MODAL_SECTION,
  payload: section,
});
