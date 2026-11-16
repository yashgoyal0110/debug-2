import Booking from '../models/booking.model.js';
import Event from '../models/event.model.js';
import ApiError from '../utils/ApiError.js';
import promoService from './promo.service.js';

const MAX_SEATS_PER_USER = 4;

const createBooking = async (userId, { eventId, seats, promoCode }) => {
  try {
    if (!eventId || !seats) {
      throw new ApiError(400, 'eventId and seats are required');
    }

    const seatCount = Number(seats);
    if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > MAX_SEATS_PER_USER) {
      throw new ApiError(400, `You can book between 1 and ${MAX_SEATS_PER_USER} seats at a time`);
    }

    const event = await Event.findById(eventId);
    if (!event || !event.isPublished) {
      throw new ApiError(404, 'Event not found');
    }

    if (new Date(event.date) < new Date()) {
      throw new ApiError(400, 'Cannot book tickets for a past event');
    }

    // Each attendee can hold at most MAX_SEATS_PER_USER confirmed seats per event
    const existingBookings = await Booking.find({
      user: userId,
      event: eventId,
      status: 'confirmed',
    });
    const alreadyBookedSeats = existingBookings.reduce((sum, b) => sum + b.seats, 0);

    if (alreadyBookedSeats >= MAX_SEATS_PER_USER) {
      throw new ApiError(
        400,
        `You can hold at most ${MAX_SEATS_PER_USER} seats per event (you already have ${alreadyBookedSeats})`
      );
    }

    if (event.availableSeats < seatCount) {
      throw new ApiError(400, `Only ${event.availableSeats} seat(s) left for ${event.title}`);
    }

    const subtotal = event.price * seatCount;
    let discount = 0;

    if (promoCode) {
      const promoResult = await promoService.redeemPromo(promoCode, subtotal);
      discount = promoResult.discount;
    }

    const totalAmount = Math.max(0, subtotal - discount);

    event.availableSeats -= seatCount;
    await event.save();

    const booking = await Booking.create({
      user: userId,
      event: event._id,
      seats: seatCount,
      ticketPrice: event.price,
      subtotal,
      discount,
      totalAmount,
      promoCode: promoCode ? promoCode.toUpperCase().trim() : null,
      status: 'confirmed',
    });

    return await booking.populate([
      { path: 'event', select: 'title city venue date price availableSeats' },
      { path: 'user', select: 'name email' },
    ]);
  } catch (error) {
    throw error;
  }
};

const getBookingsByUser = async (userId) => {
  try {
    return await Booking.find({ user: userId })
      .populate('event', 'title category city venue date price')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

const getBookingById = async (bookingId, user) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('event', 'title category city venue date price availableSeats')
      .populate('user', 'name email role');

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    // Attendees can only view their own booking; admins can view any booking
    if (booking.user._id !== user._id && user.role !== 'admin') {
      throw new ApiError(403, 'You are not allowed to view this booking');
    }

    return booking;
  } catch (error) {
    throw error;
  }
};

const cancelBooking = async (bookingId, user) => {
  try {
    const booking = await Booking.findById(bookingId).populate('event');

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.user.toString() !== user._id.toString()) {
      throw new ApiError(403, 'You can only cancel your own bookings');
    }

    if (booking.status !== 'confirmed') {
      throw new ApiError(
        400,
        `Booking cannot be cancelled because it is already ${booking.status}`
      );
    }

    booking.status = 'cancelled';
    if (booking.event) {
      booking.event.availableSeats += booking.seats;
    }

    await booking.save();

    return booking;
  } catch (error) {
    throw error;
  }
};

const checkInBooking = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId).populate(
      'event',
      'title city venue date'
    );

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.status !== 'confirmed') {
      throw new ApiError(400, `Cannot check in a booking with status: ${booking.status}`);
    }

    booking.status = 'checked_in';
    await booking.save();

    return booking;
  } catch (error) {
    throw error;
  }
};

export default {
  createBooking,
  getBookingsByUser,
  getBookingById,
  cancelBooking,
  checkInBooking,
};

