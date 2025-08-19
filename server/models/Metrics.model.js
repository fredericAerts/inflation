import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // ISO 3166-1 alpha-3 country code, e.g., 'BEL'
      required: true,
    },
    freedom_index: {
      type: Number,
    },
  },
  { collection: 'metrics' }
);

export default mongoose.model('Metrics', metricsSchema);
