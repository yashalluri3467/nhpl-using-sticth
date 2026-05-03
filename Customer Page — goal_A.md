# **Customer Page — goal**

A single, unified app screen where a traveler can plan, book, and manage **trips, hotel stays, restaurant experiences (dine/takeaway/delivery)** and interact in real-time with drivers, guides, hotel staff and restaurant staff — with simple discovery, one-tap actions, live tracking & chat, offline queueing, transparent billing, and safety controls.

---

# **MVP — features customer sees first (must-have)**

1. **Universal Hero Card (one control to rule them all)**

   * Mode toggle: **Travel (ride+guide)** / **Hotel** / **Restaurant (Dine/Takeaway/Delivery)**.

   * Smart quick package (e.g., “Netarhat day trip \+ Dinner \+ Room for night”).

2. **Quick Request / Book CTA**

   * Single-line input or form: origin/destination or hotel/restaurant \+ date/time \+ pax \+ basic preferences.

   * Instant Book vs Request mode.

3. **Unified Profile & Wallet**

   * Traveler profile (IDs, payment methods, loyalty), one wallet/receipt view that shows combined charges (trip \+ room \+ food).

4. **Real-time Match & Assign**

   * For Travel: show 1–3 matched drivers \+ guides with ETA and combined price. Separately 

   * For Hotel: show available room types.  
   * If entered booking page hold countdown will be applicable

   * For Restaurant: table availability / pickup slot / delivery ETA.  
               
5. **Order / Booking Timeline Card**

   * Single timeline component that lists active items (ex : trip, room, order) with progress and quick actions.

6. **In-app Communication**

   * Unified chat groups per booking (traveler \+ driver \+ guide \+ hotel/restaurant contact). Quick voice call button.

7. **Live Tracking & Map**

   * For trips & deliveries: route \+ live vehicle/rider location \+ shareable live link.

8. **Checkout & Split Pricing**

   * Combined checkout for multi-service bookings (optionally split by service). Clear fee breakdown (driver, guide, room, food, platform).

9. **Notifications & Alerts**

   * Push/SMS/in-app for confirmations, ETA, service updates, safety alerts.

10. **Safety & SOS**

    * One-tap SOS pinned on page to notify admin \+ emergency contact and share live location.

---

# **High-priority UX & components on Customer Page**

* **Mode bar** (Travel | Hotel | Restaurant) — toggles related inputs and suggestions.

* **Hero quick-builder** — origin/destination or search hotel/restaurant \+ date/time \+ preferences.

* **Smart suggestions** — combined itineraries (e.g., “Book driver \+ guide for Naina Falls; reserve dinner at 8; book Deluxe room for night”).

* **Unified cart/folio** (sticky) — lists active/reserved items across modules, with totals & pay button.

* **Activity timeline** (single compact vertical feed) — each item shows status badges, ETA, assigned people, and one-tap actions.

* **Chat drawer** — group chat for each trip or booking; auto-templates & translation.

* **Map & live-track pane** — toggles between trip, delivery, or hotel location view.

* **Offline queue badge** — shows queued actions and sync indicator.

* **Receipt & invoice panel** — downloadable PDF for combined transactions.

---

# **Progressive features (phase 2 — high impact)**

* Multi-stop itinerary builder (drag to reorder stops; add hotel \+ meals).

* Shared tours pooling & public guide schedules (joinable experiences).

* Split/group payments with per-person checkout links.

* Restaurant pre-order pushed to hotel for arriving groups.

* Multi-language auto-translate for chats and guide narration.

* AI assistant Chatbot  
  : suggest itinerary, upsells (spa, picnic), or routing optimizations.

---

# **Example combined user flows (realistic, short)**

1. **One-tap day trip \+ dinner \+ room**

   * User opens Customer Page → picks “Day trip” quick template → sets origin (Netarhat), destination (Naina Falls), pax, time.

   * The system shows a matched driver \+ guide with ETA, suggests nearby restaurants for dinner and shows available hotel rooms for the night.

   * The user selects driver+guide, picks a table reservation at chosen restaurant and a room; pays one combined invoice. Timeline shows all items.

2. **Travel only**

   * User requests pick-up → sees 3 matches → selects one → driver accepts → live map and chat open. After the trip, the user rates the driver & guide.

3. **Pre-order \+ hotel check-in**

   * The guest books a hotel room and uses the “pre-order dinner” option for scheduled time. The restaurant receives pre-order tied to reservation; kitchen tags pre-order as priority.

4. **Takeaway while on trip**

   * While en route the traveler orders takeaway to be ready on arrival; pickup QR auto-linked with hotel room check-in to speed pickup.

---

# **Customer-facing data model (compact)**

* **Customer**: id, name, phone, email, id\_documents\[\], payment\_methods\[\], loyalty\_id, preferences {languages, diet, accessibility}

* **CustomerFolio**: id, customer\_id, items\[{type (trip/hotel/order), ref\_id, amount, taxes}\], total, payment\_status

* **TripRequest**: id, customer\_id, origin, stops\[\], destination, start\_time, pax, preferences, assigned\_driver\_id, assigned\_guide\_id, status, price\_breakdown

* **Reservation** (hotel/restaurant): id, customer\_id, property\_id, type (room/table), datetime\_range, pax, pre\_orders\[\], status

* **Order**: id, customer\_id, restaurant\_id, mode (dine/takeaway/delivery), items, total, status

* **MessageThread**: id, participants\[\], last\_message, unread\_count

* **Notification**: id, customer\_id, type, title, body, read, timestamp

---

# **Customer-facing APIs & webhooks (essential)**

* `POST /customer/quickrequest` — create combined request (trip \+ room \+ order)

* `GET /customer/folio/{id}` — view combined invoice & line items

* `GET /customer/activities` — list active/past bookings and statuses

* `POST /chat/{threadId}/message` — send message (text/image/voice)

* `GET /track/{tripId}` — live coordinates & ETA

* `POST /payment` — pay folio or split pay

* Webhooks: `booking_confirmed`, `driver_assigned`, `guide_assigned`, `room_ready`, `order_ready`, `out_for_delivery`, `trip_started`, `trip_ended`, `payment_success`

---

# **Offline & poor-connectivity behavior (customer-first)**

* UI must be **offline-first**: allow the hero quick-builder to queue requests and show estimated sync time.

* Show clear “Queued” status and expected retry. Allow user to cancel queued requests.

* Use optimistic UI for UI responsiveness; revert with clear messages if server rejects.

* For payments: require network; for queued bookings allow “pay at property/restaurant” option when offline.

---

# **Safety, verification & UX rules (user-facing)**

* Verify drivers/guides/hotels/restaurants before showing “verified” badge; show photo, vehicle, permit/license with last-verified timestamp.

* Prominently show cancellation and refund policies before payment.

* One-tap SOS visible on every active booking card; confirm before dispatching emergency to reduce false positives.

* Require explicit consent for sharing live location (toggle per share).

* Show allergen alerts & dietary profile warnings at order checkout.

---

# 

# 

#   **Acceptance criteria (customer page)**

* Customer can create a combined trip+hotel+restaurant booking and see a single folio in **≤ 6 steps**.

* Matched drivers/guides or room holds are shown with explicit hold countdown; no double-booking on confirmed rooms.

* Live vehicle/rider tracking updates visible and refreshable within 10s in normal network conditions.

* Chat messages deliver within 3s when both parties are online; message stored and delivered when reconnecting.

* Queued offline requests are clearly shown and can be cancelled before sync.

---

# **Minimal UI screens to implement first (customer-facing)**

1. **Home / Hero Quick Builder** — single input, mode presets, suggestions.

2. **Activity Timeline / Folio Drawer** — combined bookings and pay button.

3. **Match Detail Modal** — driver+guide or room or restaurant match with accept/auto-assign.

4. **Map & Live Track** — integrated map pane for trips & deliveries.

5. **Chat Drawer** — grouped chat per booking.

6. **Reservation / Order Detail** — timeline, receipts, modify/cancel options.

7. **Settings / Profile** — payment methods, IDs, preferences, emergency contacts.

---

# **Implementation & handoff suggestions (quick)**

* Use a **single-session folio** model (one cart for multiple services) to simplify payments and refunds.

* Build modular microservices: matching, bookings, payments, chat, tracking — expose aggregated endpoints for the Customer Page.

* Prioritize **mobile-first** design and offline sync logic (local storage \+ background retry).

* Add analytics hooks: conversion, cancellations, SLA breaches, chat response times.

