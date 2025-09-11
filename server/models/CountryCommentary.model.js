import mongoose from 'mongoose';

const countryCommentarySchema = new mongoose.Schema(
  {
    _id: {
      type: String, // ISO 3166-1 alpha-3 country code, e.g., 'BEL'
      required: true,
    },
    commentary: {
      type: String,
      required: true,
    },
  },
  { collection: 'country_commentary' }
);

export default mongoose.model('CountryCommentary', countryCommentarySchema);