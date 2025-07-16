import express from 'express';
import dataControllerFactory from '../controllers/api/data.controller.js';

/*  Routing
    ======================================================== */
const router = () => {
  const apiRouter = express.Router();

  /*  USERS
      ============================================================ */
  apiRouter.route('/hello')
    .get(dataControllerFactory().getHello);

  return apiRouter;
};

export default router;
