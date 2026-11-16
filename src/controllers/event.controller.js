import eventService from '../services/event.service.js';

// GET /api/events
const getAllEvents = async (req, res) => {
  try {
    const data = await eventService.getAllEvents(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

// GET /api/events/upcoming
const getUpcomingEvents = async (req, res) => {
  try {
    const events = await eventService.getUpcomingEvents();
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

// POST /api/events (admin)
const createEvent = async (req, res) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

// PATCH /api/events/:id (admin)
const updateEvent = async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

export default {
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
};

