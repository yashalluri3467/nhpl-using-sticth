# NHPL Official Prototype

Node.js web prototype for NHPL customer travel, hotel, dining, cab planning, and admin/operator screens.

## Run Locally

```powershell
npm install
npm start
```

Open `http://127.0.0.1:8765`.

If that port is already occupied, the server automatically tries the next available port and prints the final URL.

If `APP_SEED_PASSWORD` is not set, the server prints a one-time generated seed password in the terminal. Use that password with the seeded prototype emails, or create a new customer account from the login screen.

## Neon DB Configuration

1. Create a Neon project and database.
2. Copy the pooled Postgres connection string from Neon.
3. Create `.env` from `.env.example`.
4. Set:

```powershell
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
APP_SEED_PASSWORD=choose-a-private-seed-password
PORT=8765
```

5. Start the app:

```powershell
npm start
```

The Node server creates the required tables automatically on startup and stores only salted password hashes.

## Customer Page

- The floating `Live Demo Data` panel is disabled on the customer screen.
- The old floating trip widget is removed.
- The Add button opens a short menu for trip planning, adding demo places, and viewing scheduled events.
- Explore Marketplace is functional:
  - Flights: searchable Indian airport list with from/to selection.
  - Hotels: list, detail view, ratings, prices, images, and room booking form.
  - Dining: restaurant list, detail view, ratings, images, menu, and booking form.
  - Cabs: trip planning by Today/Tomorrow and selected locations.
  - Events: saved trip plans are visible.

## Seeded Emails

- `admin@apex.local`
- `customer@nhpl.local`
- `hotel@apex.local`
- `dining@apex.local`
- `logistics@apex.local`
- `driver@apex.local`
- `travel@apex.local`
