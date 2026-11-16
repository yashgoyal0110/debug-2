import bookingService from '../services/booking.service.js';

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

// GET /api/bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getBookingsByUser(req.user._id);
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

// PATCH /api/bookings/:id/check-in (admin)
const checkInBooking = async (req, res) => {
  try {
    const booking = await bookingService.checkInBooking(req.params.id);
    res.status(200).json({ success: true, data: booking });
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
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkInBooking,
};

