import express from 'express';
import dataControllerFactory from '../controllers/api/data.controller.js';

/*  Routing
    ======================================================== */
const router = () => {
  const apiRouter = express.Router();

  /*  USERS
      ============================================================ */
  apiRouter.route('/countries')
    .get(dataControllerFactory().getCountries);

  return apiRouter;
};

export default router;
