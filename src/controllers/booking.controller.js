import asyncHandler from '../utils/asyncHandler.js';
import bookingService from '../services/booking.service.js';

// POST /api/bookings
const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  res.status(201).json({ success: true, data: booking });
});

// GET /api/bookings
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getBookingsByUser(req.user._id);
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// GET /api/bookings/:id
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user);
  res.status(200).json({ success: true, data: booking });
});

// PATCH /api/bookings/:id/cancel
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user);
  res.status(200).json({ success: true, data: booking });
});

// PATCH /api/bookings/:id/check-in (admin)
const checkInBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.checkInBooking(req.params.id);
  res.status(200).json({ success: true, data: booking });
});

export default {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkInBooking,
};
