import CountryCommentary from '../models/CountryCommentary.model.js';

const fetchCountryCommentary = async (countryCode) => {
  try {
    const commentary = await CountryCommentary.findById(countryCode).lean();
    return commentary;
  } catch (error) {
    console.error(`Error fetching commentary for ${countryCode}:`, error);
    throw error;
  }
};

export {
  fetchCountryCommentary,
}