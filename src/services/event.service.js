import Event from '../models/event.model.js';
import ApiError from '../utils/ApiError.js';

const getAllEvents = async (queryParams = {}) => {
  const { category, city, search, minPrice, maxPrice, page = 1, limit = 10 } = queryParams;

  const filter = { isPublished: true };

  if (category) {
    filter.category = category.toLowerCase();
  }

  if (city) {
    filter.city = new RegExp(`^${city.trim()}$`, 'i');
  }

  if (search) {
    filter.title = { $regex: search.trim(), $options: 'i' };
  }

  if (minPrice !== undefined) {
    filter.price = { $gte: Number(minPrice) };
  }

  if (maxPrice !== undefined) {
    filter.price = { $lte: Number(maxPrice) };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Event.find(filter).sort({ date: 1 }).skip(skip).limit(limitNum),
    Event.countDocuments(filter),
  ]);

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    items,
  };
};

const getUpcomingEvents = async () => {
  const now = new Date();
  return Event.find({
    isPublished: true,
    date: { $gt: now },
    availableSeats: { $gt: 0 },
  }).sort({ date: 1 });
};

const getEventById = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  return event;
};

const createEvent = async (payload) => {
  const { title, category, city, venue, date, price, totalSeats } = payload;

  if (!title || !category || !city || !venue || !date || price === undefined || !totalSeats) {
    throw new ApiError(400, 'All event fields are required');
  }

  const event = await Event.create({
    title,
    category,
    city,
    venue,
    date,
    price: Number(price),
    totalSeats: Number(totalSeats),
    availableSeats: Number(totalSeats),
  });

  return event;
};

const updateEvent = async (eventId, updates) => {
  const allowedFields = ['title', 'venue', 'city', 'date', 'price', 'isPublished'];
  const sanitizedUpdates = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  const event = await Event.findByIdAndUpdate(eventId, sanitizedUpdates, {
    runValidators: true,
  });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  return event;
};

export default {
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
};
