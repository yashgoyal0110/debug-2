import express from 'express';

import authRoutes from './auth.routes.js';
import eventRoutes from './event.routes.js';
import bookingRoutes from './booking.routes.js';
import promoRoutes from './promo.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/promos', promoRoutes);

export default router;
