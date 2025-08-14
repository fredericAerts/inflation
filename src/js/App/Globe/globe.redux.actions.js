export const SET_SELECTED_COUNTRY_ID = 'SET_SELECTED_COUNTRY_ID';
export const CLEAR_SELECTED_COUNTRY_ID = 'CLEAR_SELECTED_COUNTRY_ID';
export const SET_COUNTRY_MODAL_DATA = 'SET_COUNTRY_MODAL_DATA';
export const SET_MAP_INSTANCE = 'SET_MAP_INSTANCE';

export const setSelectedCountryId = (countryId) => ({
  type: SET_SELECTED_COUNTRY_ID,
  payload: countryId,
});

export const clearSelectedCountryId = () => ({
  type: CLEAR_SELECTED_COUNTRY_ID,
});

export const setCountryModalData = (data) => ({
  type: SET_COUNTRY_MODAL_DATA,
  payload: data,
});

export const setMapInstance = (mapInstance) => ({
  type: SET_MAP_INSTANCE,
  payload: mapInstance,
});
