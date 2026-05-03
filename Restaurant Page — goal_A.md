# **Restaurant Page — goal**   

A single, unified page/app area where **Travelers ↔ Restaurant staff (host, kitchen, delivery, pickup counter, POS)** interact in real time for **dine-in, takeaway, and delivery**: table reservations, ordering, kitchen ticketing, delivery dispatch, payment, order tracking, and service requests — with offline resilience, clear role UIs, audit trails, and manager/admin oversight.

---

SLA-estimating time for particular work 

# **MVP (high-priority) features — launch these first**

1. **Unified Order/Reservation Card**

   * Traveler chooses mode: **Dine-in**, **Takeaway**, or **Delivery**.

   * Inputs: date/time (or ASAP), pax (for dine-in), pickup/delivery address, special instructions, dietary preferences, promo codes.

2. **Real-time Availability & ETA**

   * Table availability (holds for a short window), kitchen load estimate, delivery ETA from nearest rider.

   * Show queue time for takeaway and estimated cooking & delivery times.

3. **Menu & Customization**

   * Full menu with categories, customizable modifiers (size, spice level, add-ons), images, allergen tags, and “chef recommendations”.

4. **Ordering & Payment**

   * Secure checkout: card / UPI / wallet / cash on delivery / pay at pickup.

   * Split bills (table), tip option, saved payment methods, promo codes, receipts.

5. **In-app Communication & Notifications**

   * Order status updates (accepted → preparing → ready → out for delivery → delivered).

   * Chat/voice between traveler ↔ host/kitchen or pickup counter; automated messages for common updates.

6. **Kitchen & POS Integration**

   * Kitchen ticketing with priority flags, printable/external POS sync, and order splitting for multi-counter kitchens.

7. **Delivery & Dispatch(dashboard)**

   * Dispatch dashboard for assigning riders (in-house or third-party), rider tracking for travelers, rider ETA updates.

8. **Takeaway Flow**

   * Timed pickup slots, order-ready alerts, and QR check-in at pickup counter to mark collected.

9. **Ratings, Complaints & Refunds**

   * Post-order rating, issue report flow, simple refund/compensation workflow.

10. **Restaurant Admin Dashboard**

    * Live orders, kitchen load, table map, delivery queue, inventory alerts, revenue summary.

---

# **Role-Specific Feature Set**

### **Traveler UI (customer-facing)**

* Mode selector: Dine-in / Takeaway / Delivery.

* Browse & filter menu (veg, non-veg, vegan, nut-free), sort by popularity or prep time.

* Build order with modifiers, multiple payment options, tip.

* Reserve table with optional pre-order for faster service.(if dine in)

* Live order tracker with map for deliveries and pickup countdown for takeaways.

* Order history, favorite orders, re-order button.

* Dietary profile (allergies, preferences) to auto-flag menu. In-app chat for order queries or special instructions.()

* Split bill feature for dine-in groupson(external split for example phonepay split)

* Offline queuing for low connectivity areas (orders auto-submit when online).

* Cancel/change policy displayed clearly.

### **Host / Front-of-House UI**

* Arrival board & table management (seating, waitlist, table status: free/reserved/occupied/dirty).

* Accept/modify reservations and pre-orders.

* Manage walk-ins with estimated wait times and SMS notifications.

* Assign servers to (n number of workers ) tables and add manual charges to folio.

* Quick replies for common messages.

### **Kitchen UI**

* Live ticket queue (priority, allergy flags, prep time).

* Split tickets to different stations (grill, dessert, drinks).

* Mark items as ready; attach photos or notes.

* Inventory low alerts for essential ingredients.  
* Prep timers and SLA indicators.

### 

### **Pickup Counter (Takeaway) UI**

* Upcoming pickups sorted by scheduled time and ready-by time.

* QR scan to confirm pickup and mark order collected.

### **Delivery / Dispatch UI**

* Dispatch dashboard: open orders, rider status, auto-match nearest rider, manual assign.

* Rider app: accept/decline order, navigation deep link, status updates (picked up, on the way, delivered), signature/photo on delivery.

* Real-time rider tracking and ETA calculation.

### **Manager / Admin UI**

* Menu & pricing management, daily specials, happy hour toggles.

* Inventory & supplier alerts (low stock triggers).

* Reports: orders/hour, average prep time, delivery times, cancellation reasons, revenue by channel.

* Refund/compensation controls and audit logs.

* Integrations: POS, payment gateway, accounting, third-party delivery platforms.

---

# **UX components & microinteractions**

* **Hero mode selector**: Dine-in / Takeaway / Delivery with prominent CTAs.

* **Live menu cards**: image, short description, price, modifiers button, "Add" microanimation.

* **Order summary drawer**: sticky on right/bottom with subtotal, taxes, tip, estimated ready/delivery time.

* **Table map**: drag-and-drop seating and reservation holds with countdown token.

* **Kitchen ticket panel**: color-coded priorities and allergy/high-sensitivity badges.

* **Dispatch map**: draggable pins for rider assignment and live routes.

* **QR pickup flow**: generate QR per order for travelers to scan at the counter.

* **Status toast/snackbar** for instant updates: "Order accepted", "Dish delayed by 8 min".

* **Offline badge & queue**: shows queued orders and retry status.

* **One-tap reorder** from history with minor edits.

---

# **Example user flows**

### **Dine-in \+ Pre-order**

1. Traveler selects Dine-in, reserve table for 2 at 8:00 PM, optionally pre-orders 2 dishes.

2. Host confirms reservation; kitchen receives pre-order at scheduled time slot to prep.

3. Traveler checks in at arrival; table assigned. Pre-order arrives faster with priority tag.

### **Takeaway (scheduled)**

1. Traveler selects Takeaway for 6:30 PM pickup, pays online.

2. Kitchen prep timed to be ready by pickup; traveler gets “Ready” notification and QR.

3. Traveler scans QR at pickup counter; order marked collected.

### **Delivery (instant)**

1. Traveler chooses Delivery, enters address, sees ETA 35–45 min.

2. Order accepted → kitchen prepares → rider assigned.

3. Rider picks up, traveler tracks in real time, delivery completed with photo/signature.

### **Issue / Refund**

* Traveler reports “cold food” with photos. Manager reviews order, kitchen log, delivery time, and issues partial/full refund or credit; entry logged in audit.

---

# **Data model (key fields)**

* **User (Customer)**: id, name, contact, email, address\[\], dietary\_profile, payment\_methods\[\], loyalty\_points

* **Restaurant**: id, name, location, hours, tables\[\], kitchens\[\], delivery\_zones\[\], settings

* **MenuItem**: id, name, category, description, price, prep\_time, modifiers\[\], images\[\], allergens\[\], availability\_flag

* **Order**: id, user\_id, restaurant\_id, mode (dine\_in/takeaway/delivery), items\[{menu\_item\_id, qty, modifiers, note}\], total, taxes, tip, payment\_status, status, assigned\_table\_id, delivery\_rider\_id, pickup\_slot

* **Table**: id, number, seats, status (free/reserved/occupied/dirty), reservation\_id

* **Reservation**: id, user\_id, table\_id (nullable), datetime, pax, status, pre\_order\_id

* **KitchenTicket**: id, order\_id, items\[\], station, priority, created\_at, ready\_at

* **DeliveryTask**: id, order\_id, rider\_id, status, pickup\_time, estimated\_delivery\_time, route, proof\_of\_delivery (photo/signature)

* **InventoryItem**: id, name, current\_stock, reorder\_threshold, unit

* **Payment**: id, order\_id, amount, method, auth\_code, status, refunded

* **AuditLog**: id, entity, action, user\_id, timestamp, details

---

# **APIs & Events (high level)**

* `POST /orders` — create order (dine/takeaway/delivery)

* `GET /menu?restaurant_id&category` — fetch menu & availability

* `POST /reservations` — create table reservation

* `POST /reservations/{id}/hold` — hold table for short time

* `POST /orders/{id}/pay` — process payment

* `GET /orders/{id}/status` — order status & ETA

* `POST /kitchen/ticket` — create kitchen ticket (internal)

* `GET /kitchen/tickets` — kitchen fetch queue

* `POST /dispatch/assign` — assign rider to delivery task

* `GET /dispatch/nearby_riders` — lookup riders near restaurant

* `POST /delivery/{taskId}/update` — rider updates (picked\_up, on\_way, delivered)

* `POST /orders/{id}/pickup_confirm` — QR pickup confirmation

* `POST /orders/{id}/issue` — report issue / claim refund

* Webhooks/events: `order_created`, `order_accepted`, `order_ready`, `order_out_for_delivery`, `order_delivered`, `reservation_confirmed`, `refund_processed`

---

# **Safety, compliance & operations**

* **Food safety & allergens**: prominent allergen tags and chef alerts on kitchen tickets for flagged items.

* **Payment security**: PCI-DSS compliant; tokenized payments.

* **Delivery safety**: contactless options.(delivery workers details are mandatory)

* **Privacy**: store minimal delivery address information and follow local regulations.

* **Fraud & chargebacks**: order pattern detection, manual review for high-value refunds.

* **Audit logs**: record changes to orders, refunds, discounts, and manual edits for accountability.

* **Health & liability**: disclaimer for food handling and allergy warnings; manager approval flows for high-risk changes.

---

# **Advanced / Nice-to-have features (phase 2\)**

* **Dynamic prep load balancing**: auto-distribute items across stations to reduce total prep time.

* **Smart dispatch & multi-hop routing**: batch deliveries and optimize rider routes (TSP).

* **Pre-order marketplace**: let hotels/hosts push pre-orders to restaurants for arriving groups.

* **Loyalty & subscriptions**: dining credits, subscription meal plans.

* **AI menu assistant**: suggest upsells, predict churn, and auto-recommend based on dietary profile.

* **Voice ordering & conversational UI** for hands-free ordering.

* **Kitchen screen analytics**: average prep times per dish, bottleneck detection.

* **AR menu preview**: see dish in AR before ordering.\*/

* **Third-party delivery aggregator integration** with two-way sync.

---

# **UX/UI implementation notes & priorities**

1. **Clear mode-first UX** — users must immediately pick Dine/Takeaway/Delivery to see relevant flows.

2. **Keep order build fast** — reduce taps for popular combos and “frequent orders”.

3. **Make wait times transparent** — show realistic ETA and confidence interval.

4. **Allergen & dietary visibility** — badges at menu card level and kitchen ticket level.

5. **Graceful failure modes** — offline ordering queue; retry logic for payments and dispatch.

6. **Mobile-first for riders & kitchen** — compact, single-column dashboards for speed.

7. **Make holds explicit** — countdown timers for table or checkout holds to avoid surprises.

8. **Security & auditability** — every refund/change must require manager approval and reason.

---

# **Suggested acceptance criteria (examples)**

* Travelers can place and pay for an order (dine/takeaway/delivery) within 4 steps.

* Kitchen ticket appears on kitchen screen within 2s of order confirmation (if online).

* Pickup QR scan marks order collected within 10s and updates traveler status.

* Rider assignment to delivery happens within 30s of order ready and rider accepts within N seconds (configurable).

* Refund/issue workflow completes with recorded reason and audit entry.l  
* 

---

# **Pages / Wireframe list (recommended)**

1. **Customer Home / Hero Mode Selector** — choose Dine / Takeaway / Delivery.

2. **Menu & Cart Page** — categories, modifiers, cart drawer, checkout.

3. **Reservation Page** — table map, time slots, pre-order option.

4. **Order Status Tracker** — timeline \+ map for delivery, QR for pickup.

5. **Kitchen Dashboard** — ticket queue, station filters, timers.

6. **Pickup Counter App** — scheduled pickups, QR scan, quick search.

7. **Dispatch Dashboard / Rider App** — assign, track, route, proof capture.

8. **Host / POS Panel** — reservations, table map, manual charges.

9. **Manager / Reports** — sales by channel, top dishes, prep times, refunds.

10. **Settings & Integrations** — payment gateway, POS, delivery partners, menu management.

