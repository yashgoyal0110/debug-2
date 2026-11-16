# 🔑 EventHive: Solutions (mentor only)

> ⚠️ **Don't share this file with the learner.** Remove it before handing the project over.

| #  | Level  | Category                       | File & Function                                       | Fix Summary |
| -- | ------ | ------------------------------ | ----------------------------------------------------- | ----------- |
| 01 | Easy   | Express route ordering         | `src/routes/event.routes.js`                          | Place `router.get('/upcoming', ...)` **before** `router.get('/:id', ...)` |
| 02 | Easy   | Mongoose `findByIdAndUpdate`   | `src/services/event.service.js` → `updateEvent`       | Pass `{ new: true, runValidators: true }` so Mongoose returns the updated doc |
| 03 | Medium | Mongoose `ObjectId` comparison | `src/services/booking.service.js` → `getBookingById`  | Compare ObjectIds with `.toString()` or `.equals()` instead of `!==` |
| 04 | Medium | Business logic (`maxDiscount`) | `src/services/promo.service.js` → `calculateDiscount` | Use `Math.min(discount, promo.maxDiscount)` instead of `Math.max(...)` |
| 05 | Medium | Query filter object overwrite  | `src/services/event.service.js` → `getAllEvents`      | Merge `$gte` and `$lte` into `filter.price` instead of reassigning `filter.price` |
| 06 | Medium | Cumulative limit check logic   | `src/services/booking.service.js` → `createBooking`   | Check `alreadyBookedSeats + seatCount > MAX_SEATS_PER_USER` instead of `alreadyBookedSeats >= MAX_SEATS_PER_USER` |
| 07 | Hard   | Populated Mongoose ref save    | `src/services/booking.service.js` → `cancelBooking`   | Call `await booking.event.save()` in addition to `await booking.save()` |

---

## Detailed Explanations & Fixes

### 🟢 BUG-01: Upcoming events feed crashes with a server error

- **Root cause:** In `src/routes/event.routes.js`, `router.get('/:id', eventController.getEventById)` is registered **above** `router.get('/upcoming', eventController.getUpcomingEvents)`. Express matches routes top-to-bottom, so `GET /api/events/upcoming` hits `/:id` with `req.params.id = "upcoming"`. Mongoose then calls `Event.findById("upcoming")` and throws `CastError: Cast to ObjectId failed for value "upcoming"`.
- **Fix (`src/routes/event.routes.js`):**
  ```js
  router.get('/', eventController.getAllEvents);
  router.get('/upcoming', eventController.getUpcomingEvents);
  router.get('/:id', eventController.getEventById);
  ```
- **Verify:** `curl http://localhost:4000/api/events/upcoming`

---

### 🟢 BUG-02: Updating an event returns old values in the response

- **Root cause:** In `src/services/event.service.js` (`updateEvent`), `Event.findByIdAndUpdate(eventId, sanitizedUpdates, { runValidators: true })` is called without `new: true`. By default, Mongoose's `findByIdAndUpdate` returns the document **as it was before the update**, even though the update succeeded in MongoDB.
- **Fix (`src/services/event.service.js`):**
  ```js
  const event = await Event.findByIdAndUpdate(eventId, sanitizedUpdates, {
    new: true,
    runValidators: true,
  });
  ```
- **Verify:**
  ```bash
  curl -X PATCH http://localhost:4000/api/events/673000000000000000000101 \
    -H "Authorization: Bearer admin-token-111" -H "Content-Type: application/json" \
    -d '{"price": 899}'
  ```

---

### 🟡 BUG-03: Attendees cannot view their own booking details

- **Root cause:** In `src/services/booking.service.js` (`getBookingById`), ownership is checked with:
  ```js
  if (booking.user._id !== user._id && user.role !== 'admin')
  ```
  Both `booking.user._id` and `user._id` are Mongoose `ObjectId` instances (objects). In JavaScript, `!==` on two separate object instances compares their memory references, which is always `true`. Every non-admin user is blocked with `403`. (`cancelBooking` below it already uses `.toString()`.)
- **Fix (`src/services/booking.service.js`):**
  ```js
  if (booking.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'You are not allowed to view this booking');
  }
  ```
- **Verify:**
  ```bash
  curl http://localhost:4000/api/bookings/673000000000000000000202 \
    -H "Authorization: Bearer rahul-token-222"
  ```


---

### 🟡 BUG-04: Percentage promo code calculates the wrong discount

- **Root cause:** In `src/services/promo.service.js` (`calculateDiscount`), when capping the percentage discount at `promo.maxDiscount`, `Math.max` was used instead of `Math.min`:
  ```js
  discount = Math.max(discount, promo.maxDiscount);
  ```
  This forces small discounts up to `maxDiscount` and lets larger discounts exceed `maxDiscount`.
- **Fix (`src/services/promo.service.js`):**
  ```js
  discount = Math.min(discount, promo.maxDiscount);
  ```
- **Verify:**
  ```bash
  curl -X POST http://localhost:4000/api/promos/validate \
    -H "Authorization: Bearer rahul-token-222" -H "Content-Type: application/json" \
    -d '{"code": "TECH20", "orderAmount": 1000}'
  ```

---

### 🟡 BUG-05: Price range filter ignores the minimum price when both bounds are set

- **Root cause:** In `src/services/event.service.js` (`getAllEvents`), when both `minPrice` and `maxPrice` are passed, the second `if` overwrites `filter.price`:
  ```js
  if (minPrice !== undefined) filter.price = { $gte: Number(minPrice) };
  if (maxPrice !== undefined) filter.price = { $lte: Number(maxPrice) };
  ```
- **Fix (`src/services/event.service.js`):**
  ```js
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }
  ```
- **Verify:** `curl "http://localhost:4000/api/events?minPrice=500&maxPrice=1500"`

---

### 🟡 BUG-06: Attendees can bypass the 4-seat per-event limit by making multiple bookings

- **Root cause:** In `src/services/booking.service.js` (`createBooking`), the per-user seat limit check only checks how many seats the user **already** has before the new booking, forgetting to add `seatCount` (the seats requested in the current booking):
  ```js
  if (alreadyBookedSeats >= MAX_SEATS_PER_USER) {
  ```
  If a user has `1`, `2`, or `3` seats already booked (`< 4`), they pass the check even if requesting `4` more seats puts them at `5–7` total seats.
- **Fix (`src/services/booking.service.js`):**
  ```js
  if (alreadyBookedSeats + seatCount > MAX_SEATS_PER_USER) {
    throw new ApiError(
      400,
      `You can hold at most ${MAX_SEATS_PER_USER} seats per event (you already have ${alreadyBookedSeats})`
    );
  }
  ```
- **Verify:**
  ```bash
  curl -X POST http://localhost:4000/api/bookings \
    -H "Authorization: Bearer rahul-token-222" -H "Content-Type: application/json" \
    -d '{"eventId": "673000000000000000000101", "seats": 4}'
  ```

---

### 🔴 BUG-07: Cancelled booking seats are never actually released for other users to book

- **Root cause:** In `src/services/booking.service.js` (`cancelBooking`):
  ```js
  booking.status = 'cancelled';
  if (booking.event) {
    booking.event.availableSeats += booking.seats;
  }
  await booking.save();
  ```
  `booking.event` is a **populated Mongoose document** from the `Event` collection (`ref: 'Event'`), not an embedded subdocument inside `Booking`. Mutating `booking.event.availableSeats` updates the in-memory object (so the JSON response from `PATCH /api/bookings/:id/cancel` shows `availableSeats: 2`), but calling `await booking.save()` only persists the `Booking` document! The `Event` document in MongoDB is never updated unless `await booking.event.save()` is also called.
- **Fix (`src/services/booking.service.js`):**
  ```js
  booking.status = 'cancelled';
  if (booking.event) {
    booking.event.availableSeats += booking.seats;
    await booking.event.save();
  }
  await booking.save();
  ```
- **Verify:**
  ```bash
  # 1. Priya cancels her booking for System Design Masterclass
  curl -X PATCH http://localhost:4000/api/bookings/673000000000000000000201/cancel \
    -H "Authorization: Bearer priya-token-333"

  # 2. Rahul books 1 seat on System Design Masterclass
  curl -X POST http://localhost:4000/api/bookings \
    -H "Authorization: Bearer rahul-token-222" -H "Content-Type: application/json" \
    -d '{"eventId": "673000000000000000000104", "seats": 1}'
  ```
