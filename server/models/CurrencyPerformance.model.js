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
      units_per_xau: {
        type: Number,
        required: true,
      },
    }],
    ten_year_performance_vs_xau_in_perc: {
      type: Number,
      required: true,
    },
  },
  { collection: 'currency_performance' }
);

export default mongoose.model('CurrencyPerformance', currencyPerformanceSchema);