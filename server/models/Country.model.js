import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    properties: {
      name: String,
      iso_a2: String,
      iso_a3: String,
      currency: String,
      currencyCode: String,
      withdrawnCurrency: String,
      withdrawnCurrencyCode: String,
      withdrawnCurrencyDate: String,
      population: Number,
      populationYear: Number,
    },
    geometry: {
      type: { type: String },
      coordinates: mongoose.Schema.Types.Mixed
    }
  },
  { collection: 'countries' }
);

export default mongoose.model('Country', countrySchema);
