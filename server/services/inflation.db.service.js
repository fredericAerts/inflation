import Inflation from '../models/Inflation.model.js';

function fetchInflationData() {
  return Inflation.find({}).lean();
}

export {
  fetchInflationData,
}