 formal, production-ready **webhook & event specification** for your platform. It’s organized by domain (Travel, Customer, Hotel, Restaurant, Shared/Admin), includes each event’s purpose, trigger conditions, recommended JSON payload schema, delivery semantics (headers, signing, retries, idempotency), versioning rules, and several **example workflows** showing event sequences for real operations. Use this as the canonical doc to implement event producers, webhook delivery service, and consumers.

I kept payloads compact and practical so you can copy/paste them into API docs or engineers’ tickets.   

---

# **Webhook & Event Spec — Overview**

* Transport: HTTPS POST (JSON) to subscriber endpoint.

* Content-Type: `application/json; charset=utf-8`

* Auth: HMAC-SHA256 signature header `X-Signature: sha256=<hex>` using shared secret per subscription.

* Idempotency: Producers include `X-Event-Id` (UUID) and `X-Idempotency-Key` when relevant. Consumers must dedupe.

* Retries: Exponential backoff (see Delivery & Retry policy).

* Schema versioning: `event_version` in payload; event type naming: `<domain>.<resource>.<action>` (e.g., `travel.trip.started`).

* Event envelope fields present on every event.

---

# **Common Event Envelope (fields present for every event)**

All events MUST be wrapped in this envelope:

`{`  
  `"event_id": "uuid-v4",`  
  `"event_type": "string",         // e.g. "travel.trip.started"`  
  `"event_version": "1.0",`  
  `"created_at": "2025-11-26T12:34:56Z",`  
  `"source": {`  
    `"service": "matching-service",`  
    `"region": "ap-south-1",`  
    `"instance_id": "i-0123456789"`  
  `},`  
  `"payload": { /* event-specific object */ }`  
`}`

HTTP headers for each webhook POST:

* `Content-Type: application/json`

* `X-Event-Id: <event_id>` (same as envelope)

* `X-Event-Type: <event_type>`

* `X-Event-Version: <event_version>`

* `X-Signature: sha256=<hex>` (HMAC-SHA256 of raw body using subscription secret)

* `X-Timestamp: <created_at>` (iso8601)

* `X-Retry-Count: <0..N>` (optional, set by sender on retries)

---

# **Delivery & Retry policy (recommended)**

* Consumers should respond 2xx on success (200 OK or 204 No Content).

* Any 2xx is success; 3xx/4xx/5xx are failures (4xx usually permanent, 5xx transient).

* Retry schedule (producer-side): 1m, 5m, 15m, 60m, 4h, 24h (6 attempts). Allow for exponential backoff with jitter.

* For 410 Gone responses (consumer intentionally unsubscribed), stop retrying and mark subscription as disabled.

* Idempotency: event\_id must be treated as unique; consumers must dedupe.

* Maximum acceptable delivery latency: \< 10s for critical events; best-effort for others.

---

# **Security & Best Practices**

* Use HTTPS; require valid TLS (no self-signed certs).

* Authenticate via HMAC `X-Signature`. Compute `HMAC_SHA256(secret, raw_body)` and hex-encode. Reject if signature missing or invalid.

* Limit payload size (e.g., 256 KB). For larger payloads, include a `payload_url` to download.

* Rotate secrets periodically; support multiple active secrets to allow rolling rotation.

* Provide test endpoint & simulator in admin console.

* Validate `created_at` within a reasonable skew window (e.g., ±5 minutes) to avoid replay attacks.

* Log deliveries and consumer responses (success/failure, latency).

* Provide optional `X-Schema-Url` header linking to canonical JSON schema.

---

# **Subscription & Management APIs (admin facing)**

* `POST /admin/webhooks` — create subscription  
   Body: `{ target_url, events: [ "travel.trip.*", "hotel.reservation.*" ], secret, active:true, name }`

* `GET /admin/webhooks` — list subscriptions

* `PATCH /admin/webhooks/{id}` — update (pause/resume, rotate secret)

* `DELETE /admin/webhooks/{id}` — delete subscription

* `POST /admin/webhooks/{id}/test` — send test event

---

# **Event Catalog (by domain)**

Each event entry contains: name, description, typical trigger, sample payload (payload only — envelope omitted for brevity), and consumer notes.

---

## **A. Travel Domain (Trips, Drivers, Guides)**

### **1\. `travel.trip.requested`**

**When:** Traveler creates a trip request (create trip).  
 **Payload:**

`{`  
  `"trip_id": "trip_123",`  
  `"customer_id": "cust_456",`  
  `"origin": {"lat": 23.0, "lng": 85.0, "address": "Netarhat Sunset Point"},`  
  `"destination": {"lat": 23.5, "lng": 85.5, "address": "Naina Falls"},`  
  `"stops": [],`  
  `"start_time": "2025-11-28T09:00:00Z",`  
  `"pax": 2,`  
  `"preferences": {"vehicle_type":"SUV","guide_language":["en","hi"]},`  
  `"price_estimate": 1200,`  
  `"payment_mode": "card_or_pay_at_pickup"`  
`}`

**Notes:** Consumers: matching-service, notifications, fraud service.

---

### **2\. `travel.matches.generated`**

**When:** Matching engine returns ranked matches (driver+guide candidates).  
 **Payload:**

`{`  
  `"trip_id": "trip_123",`  
  `"matches": [`  
    `{"driver_id":"drv_1","guide_id":"guide_5","eta":8,"distance_m":2000,"price":1400,"accept_window_s":60},`  
    `{"driver_id":"drv_2","guide_id":"guide_8","eta":10,"distance_m":3200,"price":1350,"accept_window_s":60}`  
  `],`  
  `"algorithm_version":"ranker_v2",`  
  `"ttl_seconds":60`  
`}`

**Notes:** Consumer: front-end (to display options), notification service.

---

### **3\. `travel.trip.assigned`**

**When:** Driver and/or guide accept and booking is assigned.  
 **Payload:**

`{`  
  `"trip_id": "trip_123",`  
  `"driver_id": "drv_1",`  
  `"guide_id": "guide_5",`  
  `"assigned_at": "2025-11-26T12:44:00Z",`  
  `"price_breakdown": {"driver_fee":900,"guide_fee":400,"platform_fee":100},`  
  `"payment_status":"authorized"`  
`}`

**Notes:** Consumer: tracking service, billing, notifications.

---

### **4\. `travel.driver.arrived`**

**When:** Driver marks arrived at pickup.  
 **Payload:**

`{`  
  `"trip_id":"trip_123",`  
  `"driver_id":"drv_1",`  
  `"at_location":{"lat":23.0,"lng":85.0,"address":"Netarhat Sunset Point"},`  
  `"timestamp":"2025-11-26T13:05:00Z"`  
`}`

---

### **5\. `travel.trip.started`, `travel.trip.ended`**

**When:** Trip lifecycle phases.  
 **Payload (end example):**

`{`  
  `"trip_id": "trip_123",`  
  `"started_at": "2025-11-26T13:07:00Z",`  
  `"ended_at": "2025-11-26T16:30:00Z",`  
  `"distance_m": 42000,`  
  `"fare": 1400,`  
  `"status": "completed"`  
`}`

**Notes:** Trigger fare capture, receipts, ratings prompt.

---

### **6\. `travel.trip.location_update`**

**When:** Periodic location updates (streaming).  
 **Payload:**

`{`  
  `"trip_id":"trip_123",`  
  `"driver_id":"drv_1",`  
  `"location":{"lat":23.2,"lng":85.2,"speed_kmh":40},`  
  `"timestamp":"2025-11-26T13:20:10Z"`  
`}`

**Notes:** Use for live tracking; frequency configurable.

---

### **7\. `travel.trip.cancelled`**

**When:** Trip cancelled by traveler/driver/admin.  
 **Payload:**

`{`  
  `"trip_id":"trip_123",`  
  `"cancelled_by":"customer",`  
  `"reason":"changed_plans",`  
  `"cancelled_at":"2025-11-26T12:50:00Z",`  
  `"refund_amount": 0`  
`}`

---

### **8\. `travel.provider.verification_changed`**

**When:** Driver/guide verification status changes.  
 **Payload:**

`{`  
  `"provider_id":"guide_5",`  
  `"provider_type":"guide",`  
  `"previous_status":"pending",`  
  `"new_status":"approved",`  
  `"reviewed_by":"admin_12",`  
  `"review_notes":"Docs valid"`  
`}`

---

## **B. Customer Domain (Folio, Wallet, Notifications)**

### **1\. `customer.folio.updated`**

**When:** Any change to customer's combined folio (add line item, refund).  
 **Payload:**

`{`  
  `"folio_id":"folio_789",`  
  `"customer_id":"cust_456",`  
  `"changes":[{"line_id":"l_1","type":"trip","amount":1200,"action":"added"}],`  
  `"balance_due": 3850,`  
  `"timestamp":"2025-11-26T16:31:00Z"`  
`}`

**Notes:** Consumer: billing, receipts, customer notifications.

---

### **2\. `customer.payment_succeeded` / `customer.payment_failed`**

**When:** Payment result.  
 **Payload (success example):**

`{`  
  `"payment_id":"pay_987",`  
  `"folio_id":"folio_789",`  
  `"amount":3850,`  
  `"method":"card",`  
  `"status":"succeeded",`  
  `"processed_at":"2025-11-26T16:32:12Z"`  
`}`

**Notes:** Trigger receipts, unlock reservations.

---

### **3\. `customer.notification.sent`**

**When:** System sends push/SMS/email.  
 **Payload:**

`{`  
  `"notification_id":"n_1234",`  
  `"customer_id":"cust_456",`  
  `"channel":"sms",`  
  `"category":"booking_confirmation",`  
  `"sent_at":"2025-11-26T12:45:00Z"`  
`}`

---

## **C. Hotel Domain (Reservations, Rooms, Housekeeping)**

### **1\. `hotel.reservation.created`**

**When:** Reservation created (by customer or admin).  
 **Payload:**

`{`  
  `"reservation_id":"res_234",`  
  `"property_id":"hotel_55",`  
  `"customer_id":"cust_456",`  
  `"room_type_id":"deluxe",`  
  `"checkin_date":"2025-11-28",`  
  `"checkout_date":"2025-11-29",`  
  `"status":"confirmed",`  
  `"hold_expires_at": "2025-11-26T13:30:00Z"`  
`}`

**Notes:** Consumer: front-desk, housekeeping, channel manager.

---

### **2\. `hotel.room.assigned`**

**When:** Specific room assigned.  
 **Payload:**

`{`  
  `"reservation_id":"res_234",`  
  `"room_id":"101",`  
  `"assigned_by":"frontdesk_3",`  
  `"assigned_at":"2025-11-28T10:00:00Z"`  
`}`

---

### **3\. `hotel.service_request.created`**

**When:** Guest requests housekeeping/maintenance.  
 **Payload:**

`{`  
  `"request_id":"sr_998",`  
  `"reservation_id":"res_234",`  
  `"room_id":"101",`  
  `"type":"housekeeping",`  
  `"priority":"normal",`  
  `"description":"Extra towels",`  
  `"created_at":"2025-11-28T13:00:00Z"`  
`}`

**Notes:** Consumer: housekeeping app, SLA monitor.

---

### **4\. `hotel.checkin` / `hotel.checkout`**

**When:** Guest checks in/out. Payload includes folio and digital key id if issued.

---

## **D. Restaurant Domain (Orders, Tickets, Dispatch)**

### **1\. `restaurant.order.created`**

**When:** Customer places order (dine/pickup/delivery).  
 **Payload:**

`{`  
  `"order_id":"ord_556",`  
  `"restaurant_id":"rest_11",`  
  `"customer_id":"cust_456",`  
  `"mode":"delivery",`  
  `"items":[{"id":"m_1","qty":2,"modifiers":["no_onion"]}],`  
  `"total":450,`  
  `"payment_status":"paid",`  
  `"estimated_ready_at":"2025-11-26T13:10:00Z"`  
`}`

**Notes:** Consumer: kitchen display, dispatch.

---

### **2\. `restaurant.kitchen.ticket_created`**

**When:** Ticket generated for kitchen station.  
 **Payload:**

`{`  
  `"ticket_id":"t_990",`  
  `"order_id":"ord_556",`  
  `"station":"grill",`  
  `"items":[...],`  
  `"priority":"standard",`  
  `"created_at":"2025-11-26T12:58:00Z"`  
`}`

---

### **3\. `restaurant.order.ready` / `restaurant.order.out_for_delivery` / `restaurant.order.delivered`**

**When:** Order lifecycle updates. Include rider id when out\_for\_delivery.

---

### **4\. `restaurant.inventory.low`**

**When:** Inventory item below threshold. Payload points to item id and current qty.

---

## **E. Shared / Admin Events**

### **1\. `admin.broadcast.sent`**

**When:** Admin broadcast published.  
 **Payload:**

`{`  
  `"broadcast_id":"b_321",`  
  `"target":"drivers.region.ap-south-1",`  
  `"channels":["push","sms"],`  
  `"message":"Severe weather expected. Drive safely.",`  
  `"sent_at":"2025-11-26T09:00:00Z"`  
`}`

### **2\. `system.health.alert`**

**When:** System component degraded (payment gateway down). Payload includes severity and remediation link.

---

# **Example Workflows (event sequences)**

Below are 4 common sequences with events in order — use these to implement and test your flows.

---

## **Workflow A — Trip request → match → assign → start → complete → receipt**

1. Customer submits request \-\> `travel.trip.requested` published.

2. Matching service consumes and returns matches \-\> `travel.matches.generated`.

3. Customer selects \-\> `travel.trip.assigned` (producer sets assigned driver & guide).

4. Producer pushes `customer.notification.sent` (assignment).

5. Driver reports `travel.driver.arrived`.

6. Driver starts trip \-\> `travel.trip.started`.

7. Periodic `travel.trip.location_update` events stream.

8. Driver ends trip \-\> `travel.trip.ended`.

9. Billing service creates payment \-\> `customer.payment_succeeded` (or payment\_failed).

10. `customer.folio.updated` and `customer.notification.sent` (receipt).

11. App prompts ratings; on rating creation, produce `customer.review.created` (optional).

---

## **Workflow B — Restaurant delivery**

1. Order placed \-\> `restaurant.order.created`.

2. Kitchen creates ticket \-\> `restaurant.kitchen.ticket_created`.

3. Kitchen marks ready \-\> `restaurant.order.ready`.

4. Dispatch assigns rider \-\> `restaurant.delivery.assigned`.

5. Rider picks up \-\> `restaurant.order.out_for_delivery` (include `rider_id` & `eta`).

6. Rider updates `trip.location_update` (shared travel event if same service).

7. Delivered \-\> `restaurant.order.delivered`.

8. Payment settled or tip processed \-\> `customer.payment_succeeded`.

9. If complaint \-\> `restaurant.order.issue_reported` \-\> admin support flow.

---

## **Workflow C — Hotel booking \+ pre-order dinner**

1. Reservation created \-\> `hotel.reservation.created`.

2. System places hold \-\> `hotel.room.hold_created` (optional).

3. Customer pre-orders dinner \-\> `restaurant.order.created` with `linked_reservation_id`.

4. Restaurant receives `restaurant.kitchen.ticket_created` and tags as priority (pre-order).

5. On check-in \-\> `hotel.checkin` \-\> digital key issued \-\> `hotel.digital_key.issued`.

6. On check-out \-\> `hotel.checkout` \-\> `customer.folio.updated` for final bill.

---

## **Workflow D — Dispute & refund (admin)**

1. Customer files complaint \-\> `support.ticket.created`.

2. Support agent investigates; system pulls `travel.trip.trace`, `chat transcripts`, `payment` events.

3. If refund approved \-\> `customer.payment_refund_initiated` \-\> `customer.payment_refunded`.

4. Admin writes audit entry \-\> `admin.audit.logged`.

5. `support.ticket.resolved` published.

---

# **Schema Examples (compact) — JSON Schema snippets**

Below are two example JSON Schema fragments you can put in your spec registry.

### 

### 

### **travel.trip.started schema (snippet)**

`{`  
  `"$id": "https://api.example.com/schemas/travel.trip.started.json",`  
  `"type": "object",`  
  `"properties": {`  
    `"trip_id": {"type":"string"},`  
    `"started_at": {"type":"string","format":"date-time"},`  
    `"driver_id":{"type":"string"},`  
    `"guide_id":{"type":"string"},`  
    `"initial_location":{"type":"object","properties":{"lat":{"type":"number"},"lng":{"type":"number"}}}`  
  `},`  
  `"required":["trip_id","started_at"]`  
`}`

### 

### 

### 

### **restaurant.order.created schema (snippet)**

`{`  
  `"$id":"https://api.example.com/schemas/restaurant.order.created.json",`  
  `"type":"object",`  
  `"properties":{`  
    `"order_id":{"type":"string"},`  
    `"restaurant_id":{"type":"string"},`  
    `"customer_id":{"type":"string"},`  
    `"mode":{"type":"string","enum":["dine_in","takeaway","delivery"]},`  
    `"items":{"type":"array","items":{"type":"object"}}`  
  `},`  
  `"required":["order_id","restaurant_id","mode","items"]`  
`}`

---

# **Consumer integration checklist (for engineering teams)**

1. **Create subscription** in admin portal (choose events, enter endpoint and secret).

2. **Implement signature verification** (HMAC-SHA256). Reject if fails.

3. **Dedup** using `X-Event-Id`.

4. **Return 2xx** promptly on success; avoid long processing in request handler (enqueue work then respond).

5. **Handle webhook replay** gracefully (events can be retried).

6. **Expose monitoring** (delivery latency, last received event time).

7. **Support schema versioning**: read `event_version` and handle older versions or fail gracefully.

---

# **Testing & Observability**

* Provide a webhook simulator in admin console to test payloads and signatures.

* Emit `admin.webhook.delivery` events to track success/failures for each subscription.

* Log event delivery latency, failure reason, HTTP status.

* Allow clients to download last N events for debugging.

---

# **Admin Controls around Webhooks**

* Pause/resume subscription.

* Rotate secret (old secret accepted for 5 minutes).

* View delivery logs and last response body/status.

* Retry manual delivery of specific event.

* Filter events and create test triggers (good for on-call).

---

# **Example: How a subscriber should verify signature (pseudocode)**

1. Read raw request body (byte-for-byte).

2. Compute `expected = HMAC_SHA256(subscription_secret, raw_body)` (hex).

3. Compare `expected` with header `X-Signature` using constant-time compare.

4. If match and `X-Event-Id` not seen before, accept and respond `200 OK`.

---

# **Final notes & recommended next steps**

1. Add JSON Schema links (public) for each event in your docs and include `X-Schema-Url` header in webhooks.

2. Create a test-suite that simulates full workflows (trip lifecycle, booking \+ pre-order, delivery) and validates consumer behavior.

3. Build admin UI pages to manage webhook subscriptions and inspect delivery logs.

4. Start with a limited retry schedule and increase as you observe consumer stability; add exponential backoff with jitter.

