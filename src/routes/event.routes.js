import express from 'express';
import eventController from '../controllers/event.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.get('/upcoming', eventController.getUpcomingEvents);

router.post('/', protect, authorize('admin'), eventController.createEvent);
router.patch('/:id', protect, authorize('admin'), eventController.updateEvent);

export default router;
