import mongoose from 'mongoose';

const currencyPerformanceSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Currency code (e.g., 'HTG', 'BTC', 'GOLD')
      required: true,
    },
    monthly_data: [{
      date: {
        type: String, // Format: "YYYY-MM"
        required: true,
      },
      price_usd: {
        type: Number,
        required: true,
      }
    }],
  },
  { collection: 'currency_performance' }
);

export default mongoose.model('CurrencyPerformance', currencyPerformanceSchema);