import express from 'express';
import dataControllerFactory from '../controllers/api/data.controller.js';

const dataController = dataControllerFactory();

/*  Routing
    ======================================================== */
const router = () => {
  const apiRouter = express.Router();

  /*  DATA ENDPOINTS
      ============================================================ */
  apiRouter.route('/countries')
    .get(dataController.getCountries);
  
  apiRouter.route('/inflation-data')
    .get(dataController.getInflationData);

  apiRouter.route('/metrics/:iso3')
    .get(dataController.getMetrics);
  
  apiRouter.route('/country-commentary/:countryCode')
    .get(dataController.getCountryCommentary);

  apiRouter.route('/currency-performance')
    .get(dataController.getMultipleCurrencyPerformance);
    
  apiRouter.route('/currency-performance/:currencyCode')
    .get(dataController.getCurrencyPerformance);

  return apiRouter;
};

export default router;
