import asyncHandler from '../utils/asyncHandler.js';
import eventService from '../services/event.service.js';

// GET /api/events
const getAllEvents = asyncHandler(async (req, res) => {
  const data = await eventService.getAllEvents(req.query);
  res.status(200).json({ success: true, data });
});

// GET /api/events/upcoming
const getUpcomingEvents = asyncHandler(async (req, res) => {
  const events = await eventService.getUpcomingEvents();
  res.status(200).json({ success: true, count: events.length, data: events });
});

// GET /api/events/:id
const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  res.status(200).json({ success: true, data: event });
});

// POST /api/events (admin)
const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body);
  res.status(201).json({ success: true, data: event });
});

// PATCH /api/events/:id (admin)
const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body);
  res.status(200).json({ success: true, data: event });
});

export default {
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
};
