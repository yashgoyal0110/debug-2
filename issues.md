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

1. Run `npm run seed` before starting (and anytime you want to reset the database back to its initial state).
2. Do not modify `src/data/seed.js` to fake a fix — all bugs are in the application code.
3. Each bug is independent and can be fixed in a few lines of code.

---

## 🟢 BUG-01: Upcoming events feed crashes with a server error

- [ ] Fixed

**Difficulty:** Easy

**Issue**
Opening the upcoming events feed fails with a `500 Internal server error` instead of returning upcoming events with available seats.

**Steps to reproduce**
1. Request the upcoming events list.
2. **Expected:** `200 OK` with the 4 upcoming events that have seats available.
3. **Actual:** `500 Internal server error`.

---

## 🟢 BUG-02: Updating an event returns old values in the response

- [ ] Fixed

**Difficulty:** Easy

**Issue**
When an admin updates an event's details (such as changing its ticket price or venue), the response immediately returned by the update request still displays the old values from before the edit.

**Steps to reproduce**
1. Log in as Admin to get the token (`admin-token-111`):
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@eventhive.com", "password": "admin123"}'
   ```
2. Using `Authorization: Bearer admin-token-111`, update *Node.js Backend Bootcamp* (`673000000000000000000101`) with `{ "price": 899 }`.
3. **Expected:** `200 OK` with `"price": 899` in the returned event object.
4. **Actual:** `200 OK`, but the returned event object still shows `"price": 799`.

---

## 🟡 BUG-03: Attendees cannot view their own booking details

- [ ] Fixed

**Difficulty:** Medium

**Issue**
When an attendee tries to open the details of their own booking, the server rejects the request with `403 You are not allowed to view this booking`.

**Steps to reproduce**
1. Log in as Rahul to get his token (`rahul-token-222`):
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "rahul@mail.com", "password": "rahul123"}'
   ```
2. Using `Authorization: Bearer rahul-token-222`, fetch the details of Rahul's booking (`673000000000000000000202`).
3. **Expected:** `200 OK` with Rahul's booking details. (Priya should still get `403`, and Admin should get `200`.)
4. **Actual:** Rahul gets `403 You are not allowed to view this booking`.

---

## 🟡 BUG-04: Percentage promo code calculates the wrong discount

- [ ] Fixed

**Difficulty:** Medium

**Issue**
`TECH20` is supposed to give **20% off up to a maximum discount of ₹300**. Instead, orders under ₹1,500 receive a flat ₹300 discount, and larger orders receive uncapped 20% discounts above ₹300.

**Steps to reproduce**
1. Log in as Rahul (`rahul-token-222`):
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "rahul@mail.com", "password": "rahul123"}'
   ```
2. Using `Authorization: Bearer rahul-token-222`, validate promo code `TECH20` for an `orderAmount` of `1000`.
3. Validate promo code `TECH20` for an `orderAmount` of `3000`.
4. **Expected:**
   - For `1000`: 20% is `200` (`finalAmount: 800`).
   - For `3000`: 20% is `600`, capped at `300` (`finalAmount: 2700`).
5. **Actual:**
   - For `1000`: `discount` is `300` (`finalAmount: 700`).
   - For `3000`: `discount` is `600` (`finalAmount: 2400`).

---

## 🟡 BUG-05: Price range filter ignores the minimum price when both bounds are set

- [ ] Fixed

**Difficulty:** Medium

**Issue**
Filtering events with `minPrice` alone works, and `maxPrice` alone works. However, when a user filters using both `minPrice` and `maxPrice` together, events cheaper than `minPrice` (including free events) still show up in the results.

**Steps to reproduce**
1. Fetch events filtered with `minPrice=500` and `maxPrice=1500`.
2. **Expected:** Only events priced between ₹500 and ₹1,500 are returned (*Node.js Backend Bootcamp* at ₹799, *System Design Masterclass* at ₹1,200, and *Acoustic Indie Music Night* at ₹999).
3. **Actual:** Cheaper events like *Founders & Investors Pitch Night* (₹299) and *Open Source Dev Meetup 2024* (₹0) are also returned.

---

## 🟡 BUG-06: Attendees can bypass the 4-seat per-event limit by making multiple bookings

- [ ] Fixed

**Difficulty:** Medium

**Issue**
An attendee is only allowed to hold at most **4 confirmed seats in total for the same event**. However, if a user already has 1–3 seats booked for an event, the system still lets them book up to 4 additional seats in a second booking, exceeding the 4-seat per-user limit.

**Steps to reproduce**
1. Log in as Rahul (`rahul-token-222`), who already has `1` confirmed seat for *Node.js Backend Bootcamp* (`673000000000000000000101`):
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "rahul@mail.com", "password": "rahul123"}'
   ```
2. Using `Authorization: Bearer rahul-token-222`, book `4` more seats for *Node.js Backend Bootcamp* (`673000000000000000000101`).
3. **Expected:** `400 You can hold at most 4 seats per event (you already have 1)`.
4. **Actual:** `201 Created` — the booking succeeds, giving Rahul 5 confirmed seats for the same event.

---

## 🔴 BUG-07: Cancelled booking seats are never actually released for other users to book

- [ ] Fixed

**Difficulty:** Hard

**Issue**
*System Design Masterclass* (`673000000000000000000104`) is currently sold out (`availableSeats: 0`). Priya has a confirmed booking for 2 seats (`673000000000000000000201`). When Priya cancels her booking, the cancellation response shows the booking as `cancelled` and shows `availableSeats: 2` on the event — yet when Rahul immediately tries to book 1 seat for that event (or checks the event page), the event is still sold out with `0` seats available.

**Steps to reproduce**
1. Log in as Priya (`priya-token-333`) and cancel her booking (`673000000000000000000201`):
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "priya@mail.com", "password": "priya123"}'
   ```
2. Log in as Rahul (`rahul-token-222`) and try to book `1` seat for *System Design Masterclass* (`673000000000000000000104`), or fetch the event details:
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "rahul@mail.com", "password": "rahul123"}'
   ```
3. **Expected:** The event now has `2` seats available in the database, and Rahul's booking for `1` seat succeeds (`201 Created`, leaving `1` seat available).
4. **Actual:** Rahul's booking fails with `400 Only 0 seat(s) left for System Design Masterclass`, and fetching the event still shows `"availableSeats": 0`.
