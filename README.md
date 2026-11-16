# EventHive API 🎟️

An event & workshop ticketing backend built with **Node.js, Express, and MongoDB (Mongoose)**, following a clean **Routes → Controllers → Services → Models** architecture.

> 🐞 This project has **6 known bugs** (2 Easy, 3 Medium, 1 Hard). Your job is to find and fix them.
> See [`issues.md`](issues.md).

---

## Getting started

```bash
npm install

# Create your .env file from the example and add your MongoDB URI
cp .env.example .env

# Seed sample data into MongoDB (run this anytime to reset the database)
npm run seed

# Start server in development mode with nodemon (auto-reload)
npm run dev
# or
npm start
```

The server runs on `http://localhost:4000`.

---

## Project structure

```
src/
├── server.js                 # connects to MongoDB and starts the HTTP server
├── app.js                    # express app, middlewares, routes
├── config/
│   └── db.js                 # Mongoose connection setup
├── data/
│   └── seed.js               # resets & seeds sample users, events, promos, and bookings
├── models/
│   ├── user.model.js         # User schema
│   ├── event.model.js        # Event schema
│   ├── booking.model.js      # Booking schema
│   └── promo.model.js        # Promo code schema
├── routes/                   # URL → controller mapping
├── controllers/              # reads req, calls service, sends res
├── services/                 # business logic + Mongoose queries
├── middlewares/
│   ├── auth.middleware.js    # protect (login check) + authorize (role check)
│   └── error.middleware.js   # 404 handler + central error handler
└── utils/
    ├── ApiError.js           # error class with statusCode
    └── asyncHandler.js       # forwards async errors to next()
```

---

## Authentication

Send the user token in the `Authorization` header:

```
Authorization: Bearer <token>
```

| User         | Email                | Password | Role     | Token             |
| ------------ | -------------------- | -------- | -------- | ----------------- |
| Aisha Khan   | admin@eventhive.com  | admin123 | admin    | `admin-token-111` |
| Rahul Verma  | rahul@mail.com       | rahul123 | attendee | `rahul-token-222` |
| Priya Sharma | priya@mail.com       | priya123 | attendee | `priya-token-333` |

---

## Seeded sample data (`npm run seed`)

### Events
| ID                         | Title                             | Category   | City      | Price | Available Seats | Date       |
| -------------------------- | --------------------------------- | ---------- | --------- | ----- | --------------- | ---------- |
| `673000000000000000000101` | Node.js Backend Bootcamp          | `workshop` | Bengaluru | ₹799  | 15 / 30         | 2027-02-15 |
| `673000000000000000000102` | React & Next.js India Summit      | `tech`     | Bengaluru | ₹1999 | 45 / 200        | 2027-03-10 |
| `673000000000000000000103` | Founders & Investors Pitch Night  | `business` | Mumbai    | ₹299  | 20 / 50         | 2027-01-25 |
| `673000000000000000000104` | System Design Masterclass         | `workshop` | Delhi     | ₹1200 | 0 / 20 (Sold Out)| 2027-02-28 |
| `673000000000000000000105` | Acoustic Indie Music Night        | `music`    | Pune      | ₹999  | 60 / 120        | 2027-04-05 |
| `673000000000000000000106` | Open Source Dev Meetup 2024       | `tech`     | Bengaluru | ₹0    | 10 / 80         | 2024-08-12 |

### Bookings
| ID                         | Attendee     | Event                     | Seats | Total | Status      |
| -------------------------- | ------------ | ------------------------- | ----- | ----- | ----------- |
| `673000000000000000000201` | Priya Sharma | System Design Masterclass | 2     | ₹2400 | `confirmed` |
| `673000000000000000000202` | Rahul Verma  | Node.js Backend Bootcamp  | 1     | ₹799  | `confirmed` |

### Promo Codes
| Code      | Type      | Value | Max Discount | Min Amount | Status  |
| --------- | --------- | ----- | ------------ | ---------- | ------- |
| `TECH20`  | `percent` | 20%   | ₹300         | ₹500       | Active  |
| `FLAT150` | `flat`    | ₹150  | —            | ₹1000      | Active  |
| `EARLY50` | `percent` | 50%   | ₹500         | ₹500       | Expired |

---

## API endpoints

### Auth
| Method | Endpoint          | Auth | Body                  |
| ------ | ----------------- | ---- | --------------------- |
| POST   | `/api/auth/login` | ❌   | `{ email, password }` |
| GET    | `/api/auth/me`    | ✅   |                       |

### Events
| Method | Endpoint               | Auth     | Notes |
| ------ | ---------------------- | -------- | ----- |
| GET    | `/api/events`          | ❌       | Query: `category`, `city`, `search`, `minPrice`, `maxPrice`, `page`, `limit` |
| GET    | `/api/events/upcoming` | ❌       | Future published events that still have available seats |
| GET    | `/api/events/:id`      | ❌       | Event details by ID |
| POST   | `/api/events`          | 🔒 admin | `{ title, category, city, venue, date, price, totalSeats }` |
| PATCH  | `/api/events/:id`      | 🔒 admin | `{ title?, venue?, city?, date?, price?, isPublished? }` |

### Bookings
| Method | Endpoint                     | Auth     | Body / Notes |
| ------ | ---------------------------- | -------- | ------------ |
| POST   | `/api/bookings`              | ✅       | `{ eventId, seats, promoCode? }` (max 6 seats per booking) |
| GET    | `/api/bookings`              | ✅       | Logged-in user's bookings |
| GET    | `/api/bookings/:id`          | ✅       | Booking owner or admin only |
| PATCH  | `/api/bookings/:id/cancel`   | ✅       | Booking owner only (while `confirmed`); releases seats back to the event |
| PATCH  | `/api/bookings/:id/check-in` | 🔒 admin | Marks a confirmed booking as `checked_in` |

### Promos
| Method | Endpoint               | Auth | Body                    |
| ------ | ---------------------- | ---- | ----------------------- |
| GET    | `/api/promos`          | ❌   | Lists active promos     |
| POST   | `/api/promos/validate` | ✅   | `{ code, orderAmount }` |
