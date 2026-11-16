# 🐞 EventHive: Bug Tracker

Track your progress by checking off each bug as you fix and verify it.

## Progress Checklist

- [ ] **BUG-01** (🟢 Easy): Upcoming events feed crashes with a server error
- [ ] **BUG-02** (🟢 Easy): Updating an event returns old values in the response
- [ ] **BUG-03** (🟡 Medium): Attendees cannot view their own booking details
- [ ] **BUG-04** (🟡 Medium): Percentage promo code calculates the wrong discount
- [ ] **BUG-05** (🟡 Medium): Price range filter ignores the minimum price when both bounds are set
- [ ] **BUG-06** (🟡 Medium): Attendees can bypass the 4-seat per-event limit by making multiple bookings
- [ ] **BUG-07** (🔴 Hard): Cancelled booking seats are never actually released for other users to book

---

## Rules

1. Do not modify database documents directly to fake a fix — all bugs are in the application code.
2. Each bug is independent and can be fixed in a few lines of code.

---

## 🟢 BUG-01: Upcoming events feed crashes with a server error

- [ ] Fixed

**Difficulty:** Easy

**Issue**
Opening the upcoming events feed fails with a `500 Internal server error` instead of returning upcoming events with available seats.

**Steps to reproduce**
```bash
curl http://localhost:4000/api/events/upcoming
```

- **Expected:** `200 OK` with the 4 upcoming events that have seats available.
- **Actual:** `500 Internal server error`.

---

## 🟢 BUG-02: Updating an event returns old values in the response

- [ ] Fixed

**Difficulty:** Easy

**Issue**
When an admin updates an event's details (such as changing its ticket price or venue), the response immediately returned by the update request still displays the old values from before the edit.

**Steps to reproduce**
```bash
# 1. Login as Nisha (Admin)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nisha@eventhive.com", "password": "nisha123"}'

# 2. Update Node.js Backend Bootcamp price to 899
curl -X PATCH http://localhost:4000/api/events/673000000000000000000101 \
  -H "Authorization: Bearer nisha-token-111" \
  -H "Content-Type: application/json" \
  -d '{"price": 899}'
```

- **Expected:** `200 OK` with `"price": 899` in the returned event object.
- **Actual:** `200 OK`, but the returned event object still shows `"price": 799`.

---

## 🟡 BUG-03: Attendees cannot view their own booking details

- [ ] Fixed

**Difficulty:** Medium

**Issue**
When an attendee tries to open the details of their own booking, the server rejects the request with `403 You are not allowed to view this booking`.

**Steps to reproduce**
```bash
# 1. Login as Rohit
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rohit@mail.com", "password": "rohit123"}'

# 2. Fetch Rohit's booking details
curl http://localhost:4000/api/bookings/673000000000000000000202 \
  -H "Authorization: Bearer rohit-token-222"
```

- **Expected:** `200 OK` with Rohit's booking details. (Riya and Yash should still get `403`, and Nisha should get `200`.)
- **Actual:** Rohit gets `403 You are not allowed to view this booking`.

---

## 🟡 BUG-04: Percentage promo code calculates the wrong discount

- [ ] Fixed

**Difficulty:** Medium

**Issue**
`TECH20` is supposed to give **20% off up to a maximum discount of ₹300**. Instead, orders under ₹1,500 receive a flat ₹300 discount, and larger orders receive uncapped 20% discounts above ₹300.

**Steps to reproduce**
```bash
# 1. Login as Yash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "yash@mail.com", "password": "yash123"}'

# 2. Validate TECH20 on ₹1000
curl -X POST http://localhost:4000/api/promos/validate \
  -H "Authorization: Bearer yash-token-444" \
  -H "Content-Type: application/json" \
  -d '{"code": "TECH20", "orderAmount": 1000}'

# 3. Validate TECH20 on ₹3000
curl -X POST http://localhost:4000/api/promos/validate \
  -H "Authorization: Bearer yash-token-444" \
  -H "Content-Type: application/json" \
  -d '{"code": "TECH20", "orderAmount": 3000}'
```

- **Expected:**
  - For `1000`: 20% is `200` (`finalAmount: 800`).
  - For `3000`: 20% is `600`, capped at `300` (`finalAmount: 2700`).
- **Actual:**
  - For `1000`: `discount` is `300` (`finalAmount: 700`).
  - For `3000`: `discount` is `600` (`finalAmount: 2400`).

---

## 🟡 BUG-05: Price range filter ignores the minimum price when both bounds are set

- [ ] Fixed

**Difficulty:** Medium

**Issue**
Filtering events with `minPrice` alone works, and `maxPrice` alone works. However, when a user filters using both `minPrice` and `maxPrice` together, events cheaper than `minPrice` (including free events) still show up in the results.

**Steps to reproduce**
```bash
curl "http://localhost:4000/api/events?minPrice=500&maxPrice=1500"
```

- **Expected:** Only events priced between ₹500 and ₹1,500 are returned (*Node.js Backend Bootcamp* at ₹799, *System Design Masterclass* at ₹1,200, and *Acoustic Indie Music Night* at ₹999).
- **Actual:** Cheaper events like *Founders & Investors Pitch Night* (₹299) and *Open Source Dev Meetup 2024* (₹0) are also returned.

---

## 🟡 BUG-06: Attendees can bypass the 4-seat per-event limit by making multiple bookings

- [ ] Fixed

**Difficulty:** Medium

**Issue**
An attendee is only allowed to hold at most **4 confirmed seats in total for the same event**. However, if a user already has 1–3 seats booked for an event, the system still lets them book up to 4 additional seats in a second booking, exceeding the 4-seat per-user limit.

**Steps to reproduce**
```bash
# 1. Login as Rohit (already has 1 confirmed seat for Node.js Backend Bootcamp)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rohit@mail.com", "password": "rohit123"}'

# 2. Book 4 more seats for Node.js Backend Bootcamp
curl -X POST http://localhost:4000/api/bookings \
  -H "Authorization: Bearer rohit-token-222" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "673000000000000000000101", "seats": 4}'
```

- **Expected:** `400 You can hold at most 4 seats per event (you already have 1)`.
- **Actual:** `201 Created` — the booking succeeds, giving Rohit 5 confirmed seats for the same event.

---

## 🔴 BUG-07: Cancelled booking seats are never actually released for other users to book

- [ ] Fixed

**Difficulty:** Hard

**Issue**
*System Design Masterclass* (`673000000000000000000104`) is currently sold out (`availableSeats: 0`). Riya has a confirmed booking for 2 seats (`673000000000000000000201`). When Riya cancels her booking, the cancellation response shows the booking as `cancelled` and shows `availableSeats: 2` on the event — yet when Yash immediately tries to book 1 seat for that event (or checks the event page), the event is still sold out with `0` seats available.

**Steps to reproduce**
```bash
# 1. Login as Riya
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "riya@mail.com", "password": "riya123"}'

# 2. Riya cancels her booking for System Design Masterclass
curl -X PATCH http://localhost:4000/api/bookings/673000000000000000000201/cancel \
  -H "Authorization: Bearer riya-token-333"

# 3. Login as Yash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "yash@mail.com", "password": "yash123"}'

# 4. Yash tries to book 1 released seat on System Design Masterclass
curl -X POST http://localhost:4000/api/bookings \
  -H "Authorization: Bearer yash-token-444" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "673000000000000000000104", "seats": 1}'

# 5. Check event details
curl http://localhost:4000/api/events/673000000000000000000104
```

- **Expected:** The event now has `2` seats available in the database, and Yash's booking for `1` seat succeeds (`201 Created`, leaving `1` seat available).
- **Actual:** Yash's booking fails with `400 Only 0 seat(s) left for System Design Masterclass`, and fetching the event still shows `"availableSeats": 0`.
