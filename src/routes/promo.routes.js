import express from 'express';
import promoController from '../controllers/promo.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', promoController.getActivePromos);
router.post('/validate', protect, promoController.validatePromo);

export default router;
