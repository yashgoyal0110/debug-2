# EventHive API 🎟️

An event & workshop ticketing backend built with **Node.js, Express, and MongoDB (Mongoose)**, following a clean **Routes → Controllers → Services → Models** architecture.

> 🐞 This project has **7 known bugs** (2 Easy, 4 Medium, 1 Hard). Your job is to find and fix them.
> See [`issues.md`](issues.md).

---

## Getting started

```bash
npm install

# Create your .env file from the example and add your MongoDB URI
cp .env.example .env

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
├── models/
│   ├── user.model.js         # User schema
│   ├── event.model.js        # Event schema
│   ├── booking.model.js      # Booking schema
│   └── promo.model.js        # Promo code schema
├── routes/                   # URL → controller mapping
├── controllers/              # reads req, calls service inside try/catch, sends res
├── services/                 # business logic + Mongoose queries
├── middlewares/
│   └── auth.middleware.js    # protect (login check) + authorize (role check)
└── utils/
    └── ApiError.js           # error class with statusCode
```

---

## Authentication

Log in to get a user's token, or pass the token directly in the `Authorization` header:

```
Authorization: Bearer <token>
```

| User           | Email               | Password | Role     | Token             |
| -------------- | ------------------- | -------- | -------- | ----------------- |
| Nisha Gupta    | nisha@eventhive.com | nisha123 | admin    | `nisha-token-111` |
| Rohit Malhotra | rohit@mail.com      | rohit123 | attendee | `rohit-token-222` |
| Riya Kapoor    | riya@mail.com       | riya123  | attendee | `riya-token-333`  |
| Yash Goyal     | yash@mail.com       | yash123  | attendee | `yash-token-444`  |

### Login & Auth `curl` Commands

```bash
# Login as Nisha (Admin)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nisha@eventhive.com", "password": "nisha123"}'

# Login as Rohit (Attendee)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rohit@mail.com", "password": "rohit123"}'

# Login as Riya (Attendee)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "riya@mail.com", "password": "riya123"}'

# Login as Yash (Attendee)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "yash@mail.com", "password": "yash123"}'

# Verify logged-in profile (/api/auth/me)
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer rohit-token-222"
```

---

## Database sample data

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
| ID                         | Attendee       | Event                     | Seats | Total | Status      |
| -------------------------- | -------------- | ------------------------- | ----- | ----- | ----------- |
| `673000000000000000000201` | Riya Kapoor    | System Design Masterclass | 2     | ₹2400 | `confirmed` |
| `673000000000000000000202` | Rohit Malhotra | Node.js Backend Bootcamp  | 1     | ₹799  | `confirmed` |

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
| POST   | `/api/bookings`              | ✅       | `{ eventId, seats, promoCode? }` (max 4 confirmed seats per user per event) |
| GET    | `/api/bookings`              | ✅       | Logged-in user's bookings |
| GET    | `/api/bookings/:id`          | ✅       | Booking owner or admin only |
| PATCH  | `/api/bookings/:id/cancel`   | ✅       | Booking owner only (while `confirmed`); releases seats back to the event |
| PATCH  | `/api/bookings/:id/check-in` | 🔒 admin | Marks a confirmed booking as `checked_in` |

### Promos
| Method | Endpoint               | Auth | Body                    |
| ------ | ---------------------- | ---- | ----------------------- |
| GET    | `/api/promos`          | ❌   | Lists active promos     |
| POST   | `/api/promos/validate` | ✅   | `{ code, orderAmount }` |
