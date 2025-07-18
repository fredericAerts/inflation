import mongoose from 'mongoose';

const inflationSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // ISO 3166-1 alpha-3 country code, e.g., 'BEL'
      required: true,
    },
    avg_inflation_last_10_years: {
      type: Number,
      required: true,
    },
    yoy_inflation: {
      type: Map,
      of: Number, // keys are years as strings, values are inflation percentages
      required: true,
    },
  },
  { collection: 'inflation' }
);

export default mongoose.model('Inflation', inflationSchema);
