#  **Admin Controls — separated by domain  (Hotel Management, Travel, Restaurant, Customer)**

Below I’ve split **all admin control features**, the **APIs** and **events/webhooks** they use, and the **admin privileges** that apply across the entire platform. Use this as the authoritative admin spec for the documentary — it maps which admin capabilities belong to each product page and the exact endpoints/events admins will need to operate them.

---

# **1\. Global admin privileges (applies across all domains)**

These are the high-level permissions that can be assigned to admin accounts (grant any combination). Implement as fine-grained flags in your RBAC system.

**Global privilege categories**

* `super_admin` — full access (dangerous).

* `view_all` — read-only across all entities (bookings, users, payouts, logs).

* `manage_users` — create/edit/disable users, reset passwords, invite.

* `manage_roles` — create/edit roles and permissions.

* `manage_properties` — add/edit/delete hotels & restaurants.

* `manage_providers` — add/edit/disable drivers/guides/riders.

* `dispatch_control` — manual assignment/reassign trips and deliveries.

* `finance` — view transactions, issue refunds, run payouts, export ledgers.

* `support` — create/resolve tickets, escalate disputes.

* `verification` — review/approve identity & document verification.

* `reports_analytics` — run/export reports, schedule reports.

* `feature_flags` — toggle experiments and rollout features.

* `integrations` — manage API keys, webhooks, third-party connections (payment gateway, SMS, OTA).

* `compliance` — data export/erase (GDPR), retention policy control.

* `read_audit_log` / `write_audit_log` — view & annotate audit entries.

* `emergency_actions` — suspend accounts, cancel bookings, override holds.

Implementation note: map these to resource-level actions (e.g., `refund:create:limit=1000` or `payout:issue:regions=[IN]`) so you can set granular scopes.

---

# **2\. Admin features, APIs & events — Hotel Management Page**

## **2.1 Admin features (hotel domain)**

* Create / Edit / Delete property (hotel).

* Manage room types, individual rooms, photos, amenities, policies.

* Inventory controls: set live room counts, hold window defaults, auto-release timers.

* Rate rules & discount controls (seasonal rules, promo codes, corporate rates).

* OTA / channel manager connection: enable/disable sync, mapping rules.

* Reservation management: view/edit bookings, assign room, extend/shorten stays, overbook handling.

* Folio / charges: post room/F\&B charges to folio, split bills, apply refunds.

* Check-in / Check-out override, digital key issuance settings.

* Housekeeping / maintenance task queue monitor and escalation.

* Guest profile access & notes (allergies, VIP flag).

* Property user management (front-desk, housekeeping accounts), shift scheduling.

* Verification of property docs and business license.

* Reports: occupancy, ADR, RevPAR, cancellations, no-shows.

* Manual settlement & payouts to property owners.

* Audit logs for all folio edits, refunds, rate changes.

  ## **2.2 Hotel admin APIs (examples)**

* `POST /admin/properties` — create property.

* `GET /admin/properties/{id}` — view property.

* `PATCH /admin/properties/{id}` — update property metadata.

* `POST /admin/properties/{id}/rooms` — create room / room type.

* `PATCH /admin/rooms/{id}/status` — update room status (dirty/available/maintenance).

* `GET /admin/reservations?property_id=&from=&to=` — list reservations.

* `POST /admin/reservations/{id}/assign_room` — assign specific room.

* `POST /admin/reservations/{id}/hold` — place/release hold.

* `POST /admin/folio/{reservation_id}/charge` — post charge.

* `POST /admin/folio/{reservation_id}/refund` — refund charge.

* `GET /admin/housekeeping/tasks?property_id=` — tasks list.

* `POST /admin/housekeeping/tasks/{id}/assign` — assign task.

* `GET /admin/reports/occupancy?from=&to=&property_id=` — export occupancy.

* `POST /admin/payouts/property/{property_id}` — manual payout.

  ## **2.3 Hotel events / webhooks**

* `reservation_created`

* `reservation_confirmed`

* `room_assigned`

* `room_status_changed`

* `folio_line_added`

* `folio_refunded`

* `checkin` / `checkout`

* `housekeeping_task_created` / `task_completed`

* `ota_sync_error`

* `property_verification_changed`

  ---

  # **3\. Admin features, APIs & events — Traveling Page (Trips, Drivers, Guides)**

  ## **3.1 Admin features (travel domain)**

* Provider management: onboard/disable drivers, guides, vehicles.

* Document verification hub for drivers/guides (license, permit, background check).

* Region/zone controls: set service areas, working hours, surge zones.

* Matching & dispatch control: tune matching weights (distance, rating), force-assign drivers/guides, reassign in-progress trips.

* Live map & heatmap of active trips, drivers online/offline statuses.

* Monitor accept/decline rates; suspend or flag poor-performing providers.

* Manage availability calendars and capability tags (languages, specialties).

* Trip & route monitoring: view GPS traces, trip timelines, chat logs.

* Safety & incident management: open incident reports, block/unblock accounts, emergency contact response.

* Fare management: base fares, guide hourly rates, platform commission, promo & coupon management.

* Transaction / payout engine for driver/guide payouts and commission splits.

* Reports: trips/day, cancellations, average acceptance time, earnings reports.

* Fraud detection & anti-abuse rules (phone re-use, suspicious refund patterns).

* API key & webhook configuration for partner integrations (e.g., fleet partners).

  ## **3.2 Travel admin APIs (examples)**

* `GET /admin/drivers?status=&region=` — list drivers.

* `POST /admin/drivers` — create driver (invite).

* `PATCH /admin/drivers/{id}/verify` — approve verification.

* `POST /admin/trips/{tripId}/force_reassign` — reassign driver/guide.

* `GET /admin/trips/{tripId}/trace` — GPS trace & events.

* `POST /admin/trips/{tripId}/cancel` — cancel trip (with reason/refund options).

* `GET /admin/match-settings` — view matching weighting.

* `POST /admin/match-settings` — update matching weights (rollout via feature flag).

* `GET /admin/reports/trips?from=&to=&region=` — export trip reports.

* `POST /admin/payouts/drivers` — schedule payouts.

* `GET /admin/availability/{userId}` — view/override provider availability.

  ## **3.3 Travel events / webhooks**

* `trip_requested`

* `driver_matched` / `guide_matched`

* `driver_assigned` / `guide_assigned`

* `driver_arrived` / `trip_started` / `trip_ended`

* `driver_declined` / `guide_declined`

* `trip_cancelled`

* `payment_success` / `payment_failed`

* `payout_processed`

* `safety_incident_reported`

* `provider_verification_changed`

  ---

  # **4\. Admin features, APIs & events — Restaurant Page (Dine/Takeaway/Delivery)**

  ## **4.1 Admin features (restaurant domain)**

* Restaurant onboarding: create venues, menus, kitchen stations, delivery zones.

* Menu management: CRUD menu items, modifiers, allergens, images, availability flags.

* Table map editor for dine-in (floorplan, table capacity, reservation holds).

* Order & kitchen monitoring: view live order queue, reassign tickets, mark priority.

* Dispatch & rider management: assign riders, integrate third-party aggregators, manage rider pools.

* Inventory alerts & stock management: set reorder thresholds and supplier info.

* Promo & happy-hour scheduling.

* Financials: order revenue, refunds, tip handling, settlement to restaurants.

* Pickup & QR code settings (timeout, verification rules).

* Reports: orders/hour, average prep time, delivery times, cancellations, revenue by channel.

* Integrations: POS sync, accounting export, delivery aggregator connectors.

* Incident & complaint handling: food complaints, refunds, compensation.  
  0  
* Kitchen SLA config (max prep time thresholds).

* Manager-level controls: close menu items, toggle delivery availability.

  ## **4.2 Restaurant admin APIs**

* `POST /admin/restaurants` — create a restaurant.

* `PATCH /admin/restaurants/{id}` — edit restaurant meta.

* `POST /admin/restaurants/{id}/menu_items` — add menu item.

* `PATCH /admin/menu_items/{id}/status` — set availability.

* `GET /admin/orders?status=&restaurant_id=` — live orders list.

* `POST /admin/orders/{id}/ticket_reassign` — reassign order to different kitchen/station.

* `POST /admin/dispatch/assign` — assign rider to delivery task.

* `POST /admin/orders/{id}/refund` — issue refund.

* `GET /admin/reports/kitchen?from=&to=&restaurant_id=` — export kitchen metrics.

* `POST /admin/restaurants/{id}/payout` — manual settlement to restaurant.

  ## **4.3 Restaurant events / webhooks**

* `order_created`

* `order_accepted` / `order_preparing` / `order_ready`

* `order_out_for_delivery` / `order_delivered`

* `pickup_confirmed`

* `order_cancelled`

* `menu_item_updated`

* `inventory_low`

* `restaurant_status_changed` (open/closed)

  ---

  # **5\. Admin features, APIs & events — Customer Page (Customer-facing controls & customer data management)**

  ## **5.1 Admin features (customer domain)**

* Customer account management: search, view, edit, suspend accounts.

* Wallet & payment method controls: view payment methods (masked), process manual refunds, credit customer wallets.

* Combined folio management: view and edit CustomerFolio across trip/hotel/order lines.

* Notifications & broadcast targeting customers (promo campaigns, service advisories).

* Reservation overrides: modify bookings on behalf of customers, re-issue receipts/invoices.

* Consent & privacy actions: export user data, erase user data (GDPR tools).

* Loyalty programs: adjust points, tiers, promo allocations.

* Support ticket creation for customer and view history.

* Rate & review moderation: remove or flag inappropriate reviews.

* Fraud detection & account restrictions: mark accounts for review, block suspicious bookings.

* Analytics: customer cohorts, LTV, churn signals.

  ## **5.2 Customer admin APIs**

* `GET /admin/customers?query=` — search customers.

* `GET /admin/customers/{id}/folio` — view combined folio.

* `POST /admin/customers/{id}/credit` — credit wallet.

* `POST /admin/customers/{id}/refund` — refund transaction.

* `POST /admin/notifications/send` — send targeted push/SMS/email.

* `POST /admin/customers/{id}/suspend` — suspend account.

* `POST /admin/customers/{id}/export` — export PII for DSAR.

* `POST /admin/customers/{id}/erase` — initiate erasure (subject to compliance rules).

* `GET /admin/loyalty/reports` — fetch loyalty metrics.

  ## **5.3 Customer events / webhooks**

* `customer_created` / `customer_updated`

* `folio_updated`

* `invoice_issued`

* `wallet_credit` / `wallet_debit`

* `customer_suspended`

* `notification_sent`

* `review_flagged`

* `dsar_export_completed`

  ---

  # **6\. Cross-domain (shared) APIs & events for admin usage**

These are shared control-plane APIs and events the admin console will commonly use across domains.

## **Shared admin APIs**

* `GET /admin/metrics/overview` — aggregate KPIs across domains.

* `GET /admin/search` — global search by id/phone/plate/address.

* `GET /admin/audit` — fetch audit logs.

* `POST /admin/featureflags/{name}/toggle` — toggle a feature.

* `POST /admin/webhooks` — register webhook subscriptions.

* `GET /admin/health` — system health & dependency checks (payments, SMS, maps).

* `POST /admin/broadcast` — send platform-wide message.

  ## **Shared events / webhooks**

* `payment_success` / `payment_failed`

* `refund_processed`

* `payout_processed`

* `dispute_created` / `dispute_resolved`

* `system_alert` (e.g., payment gateway down)

* `feature_flag_changed`

  ---

  # **7\. Admin UI pages / sections mapped to domains**

(quick mapping so front-end teams build the right screens)

* **Global Dashboard** — global KPIs, live map, active alerts.

* **Users & Roles** — manage admin users \+ RBAC.

* **Verification Center** — (shared) pending verifications for providers & properties.

* **Properties** — hotels & restaurants (create/edit rooms, menus).

* **Providers** — drivers, guides, riders (onboard/verify/disable).

* **Bookings / Orders / Trips** — search, view timeline, edit, reassign, refund.

* **Dispatch Center** — manual assign trips & deliveries.

* **Financials** — transactions, refunds, payouts.

* **Support & Tickets** — ticket inbox and SLA dashboard.

* **Reports & Exports** — per-domain report builder & scheduled exports.

* **Integrations & Keys** — payment gateways, SMS, map provider, OTA connectors.

* **Feature Flags & Experiments** — control panel for match or pricing experiments.

* **Audit Log & Compliance** — read/export logs and DSAR tools.

  ---

  # **8\. Example privilege mappings (who can do what)**

Below are suggested role-to-privilege mappings (start here; tweak to suit ops)

* **Super Admin** \= all privileges.

* **Regional Ops Manager** \= `view_all`, `dispatch_control`, `manage_providers`, `support`, `manage_properties` (region-limited).

* **Hotel Manager** \= `manage_properties` (specific property), `support`, `read_audit_log`, `finance` (limited to property).

* **Restaurant Manager** \= `manage_properties` (restaurant), `refund` (limited), `reports_analytics`.

* **Dispatch Agent** \= `dispatch_control`, `view_all_trips`, `manage_providers` (riders).

* **Support Agent** \= `support`, `view_all`, `issue_refunds` (threshold limited), `create_tickets`.

* **Finance** \= `finance`, `payouts`, `export_reports`.

* **Compliance Officer** \= `verification`, `compliance`, `read_audit_log`, `data_erase` (controlled flows).

  ---

  # **9\. Implementation notes & best practices for admin controls**

* **Principle of least privilege**: default to narrow roles; require approvals for dangerous operations (refunds \> threshold, account suspension).

* **Audit everything**: all admin actions must write to immutable audit logs with actor, timestamp, reason.

* **Soft actions / undo**: for destructive actions (erase, delete), implement soft-delete \+ retention window \+ reversible steps.

* **Approval flows**: multi-step approvals for finance and high-impact changes.

* **Rate limiting & safety**: admin APIs must be throttled and subject to SSO \+ MFA.

* **Feature flags**: expose match/rate engine weights to an experiments panel; roll out gradually.

* **Region scoping**: admins can be scoped to regions/properties to reduce blast radius.

* **Test/sandbox**: provide a sandbox admin role that can simulate trips/orders without affecting production money or sending user notifications.

  ---

