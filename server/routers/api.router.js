import express from 'express';
import dataControllerFactory from '../controllers/api/data.controller.js';
const dataController = dataControllerFactory();

/*  Routing
    ======================================================== */
const router = () => {
  const apiRouter = express.Router();

  /*  USERS
      ============================================================ */
  apiRouter.route('/countries')
    .get(dataController.getCountries);
  
  apiRouter.route('/inflation-data')
    .get(dataController.getInflationData);

  return apiRouter;
};

export default router;
