import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/user.model.js';
import Event from '../models/event.model.js';
import Booking from '../models/booking.model.js';
import Promo from '../models/promo.model.js';

export const SEED_IDS = {
  users: {
    admin: '673000000000000000000001',
    rahul: '673000000000000000000002',
    priya: '673000000000000000000003',
  },
  events: {
    nodeBootcamp: '673000000000000000000101',
    reactSummit: '673000000000000000000102',
    startupPitch: '673000000000000000000103',
    systemDesign: '673000000000000000000104',
    indieNight: '673000000000000000000105',
    pastMeetup: '673000000000000000000106',
  },
  bookings: {
    priyaBooking: '673000000000000000000201',
    rahulBooking: '673000000000000000000202',
  },
};

const users = [
  {
    _id: SEED_IDS.users.admin,
    name: 'Aisha Khan',
    email: 'admin@eventhive.com',
    password: 'admin123',
    role: 'admin',
    token: 'admin-token-111',
  },
  {
    _id: SEED_IDS.users.rahul,
    name: 'Rahul Verma',
    email: 'rahul@mail.com',
    password: 'rahul123',
    role: 'attendee',
    token: 'rahul-token-222',
  },
  {
    _id: SEED_IDS.users.priya,
    name: 'Priya Sharma',
    email: 'priya@mail.com',
    password: 'priya123',
    role: 'attendee',
    token: 'priya-token-333',
  },
];

const events = [
  {
    _id: SEED_IDS.events.nodeBootcamp,
    title: 'Node.js Backend Bootcamp',
    category: 'workshop',
    city: 'Bengaluru',
    venue: 'Indiranagar Tech Hub',
    date: new Date('2027-02-15T10:00:00.000Z'),
    price: 799,
    totalSeats: 30,
    availableSeats: 15,
    isPublished: true,
  },
  {
    _id: SEED_IDS.events.reactSummit,
    title: 'React & Next.js India Summit',
    category: 'tech',
    city: 'Bengaluru',
    venue: 'NIMHANS Convention Centre',
    date: new Date('2027-03-10T09:00:00.000Z'),
    price: 1999,
    totalSeats: 200,
    availableSeats: 45,
    isPublished: true,
  },
  {
    _id: SEED_IDS.events.startupPitch,
    title: 'Founders & Investors Pitch Night',
    category: 'business',
    city: 'Mumbai',
    venue: 'BKC CoWrks Lounge',
    date: new Date('2027-01-25T18:00:00.000Z'),
    price: 299,
    totalSeats: 50,
    availableSeats: 20,
    isPublished: true,
  },
  {
    _id: SEED_IDS.events.systemDesign,
    title: 'System Design Masterclass',
    category: 'workshop',
    city: 'Delhi',
    venue: 'Connaught Place Studio',
    date: new Date('2027-02-28T11:00:00.000Z'),
    price: 1200,
    totalSeats: 20,
    availableSeats: 0, // Currently sold out (Priya holds 2 seats)
    isPublished: true,
  },
  {
    _id: SEED_IDS.events.indieNight,
    title: 'Acoustic Indie Music Night',
    category: 'music',
    city: 'Pune',
    venue: 'Koregaon Park Amphitheatre',
    date: new Date('2027-04-05T19:30:00.000Z'),
    price: 999,
    totalSeats: 120,
    availableSeats: 60,
    isPublished: true,
  },
  {
    _id: SEED_IDS.events.pastMeetup,
    title: 'Open Source Dev Meetup 2024',
    category: 'tech',
    city: 'Bengaluru',
    venue: 'HSR Layout Arena',
    date: new Date('2024-08-12T10:00:00.000Z'),
    price: 0,
    totalSeats: 80,
    availableSeats: 10,
    isPublished: true,
  },
];

const bookings = [
  {
    _id: SEED_IDS.bookings.priyaBooking,
    user: SEED_IDS.users.priya,
    event: SEED_IDS.events.systemDesign,
    seats: 2,
    ticketPrice: 1200,
    subtotal: 2400,
    discount: 0,
    totalAmount: 2400,
    promoCode: null,
    status: 'confirmed',
  },
  {
    _id: SEED_IDS.bookings.rahulBooking,
    user: SEED_IDS.users.rahul,
    event: SEED_IDS.events.nodeBootcamp,
    seats: 1,
    ticketPrice: 799,
    subtotal: 799,
    discount: 0,
    totalAmount: 799,
    promoCode: null,
    status: 'confirmed',
  },
];

const promos = [
  {
    code: 'TECH20',
    type: 'percent',
    value: 20,
    maxDiscount: 300,
    minOrderAmount: 500,
    expiresAt: new Date('2030-12-31T23:59:59.000Z'),
    usageLimit: 100,
    usedCount: 10,
    isActive: true,
  },
  {
    code: 'FLAT150',
    type: 'flat',
    value: 150,
    maxDiscount: null,
    minOrderAmount: 1000,
    expiresAt: new Date('2030-06-30T23:59:59.000Z'),
    usageLimit: 50,
    usedCount: 5,
    isActive: true,
  },
  {
    code: 'EARLY50',
    type: 'percent',
    value: 50,
    maxDiscount: 500,
    minOrderAmount: 500,
    expiresAt: new Date('2024-12-31T23:59:59.000Z'),
    usageLimit: 200,
    usedCount: 80,
    isActive: true,
  },
];

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      Booking.deleteMany({}),
      Event.deleteMany({}),
      Promo.deleteMany({}),
      User.deleteMany({}),
    ]);

    await User.insertMany(users);
    await Event.insertMany(events);
    await Promo.insertMany(promos);
    await Booking.insertMany(bookings);

    console.log('Database seeded successfully with sample users, events, promos, and bookings.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
