import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const SCREEN_DIR = path.join(__dirname, "stitch_21st_design_system");
const PORT = Number(process.env.PORT || 8765);
const DATABASE_URL = process.env.DATABASE_URL || "";
const SEED_PASSWORD = process.env.APP_SEED_PASSWORD || crypto.randomBytes(9).toString("base64url");
const ENABLE_DEMO_DATA = process.env.APP_ENABLE_DEMO_DATA === "true";

const { Pool } = pg;
const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes("sslmode=require") || DATABASE_URL.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
    })
  : null;

const SCREEN_MAP = {
  voyagecore: path.join(SCREEN_DIR, "voyagecore_your_all_in_one_journey", "code.html"),
  "master-admin-ecosystem": path.join(SCREEN_DIR, "master_admin_ecosystem_overview", "code.html"),
  "master-admin-global": path.join(SCREEN_DIR, "master_admin_global_control_plane", "code.html"),
  "restaurant-dispatch": path.join(SCREEN_DIR, "restaurant_ops_orders_dispatch", "code.html"),
  "restaurant-kitchen": path.join(SCREEN_DIR, "restaurant_ops_orders_kitchen_queue", "code.html"),
  "hotel-inventory": path.join(SCREEN_DIR, "hotel_ops_inventory_service_queue", "code.html"),
  "hotel-inventory": path.join(SCREEN_DIR, "hotel_ops_inventory_service_queue", "code.html"),
  "driver-portal": path.join(SCREEN_DIR, "driver_partner_portal_daily_dispatch", "code.html"),
  "driver-trip": path.join(SCREEN_DIR, "driver_personal_trip_dispatch", "code.html"),
  "travel-hub": path.join(SCREEN_DIR, "travel_hub_coordination_dispatch", "code.html"),
  // Cluster-based interfaces
  "customer-cluster": path.join(PUBLIC_DIR, "clusters", "customer", "index.html"),
  "hotel-cluster": path.join(PUBLIC_DIR, "clusters", "hotel", "index.html"),
  "restaurant-cluster": path.join(PUBLIC_DIR, "clusters", "restaurant", "index.html"),
  "travel-cluster": path.join(PUBLIC_DIR, "clusters", "travel", "index.html"),
};

const DOMAIN_SCREENS = {
  admin: [
    { slug: "admin-logistics", title: "Logistics Control", icon: "local_shipping", url: "/clusters/travel/admin.html" },
    { slug: "travel-hub", title: "Legacy Coordination", icon: "hub", url: "/screens/travel-hub" },
    { slug: "admin-system", title: "System Health", icon: "monitoring", url: "/clusters/travel/admin.html#stats" }
  ],
  customer: [
    { slug: "customer-dashboard", title: "Voyage Portal", icon: "explore", url: "/clusters/customer" }
  ],
  hotels: [
    { slug: "hotel-cluster", title: "Hotel Management", icon: "apartment", url: "/clusters/hotel" },
    { slug: "hotel-inventory", title: "Legacy Inventory", icon: "inventory", url: "/screens/hotel-inventory" },
  ],
  dining: [
    { slug: "restaurant-cluster", name: "Ops (Cluster)" },
    { slug: "restaurant-dispatch", name: "Legacy Dispatch" },
    { slug: "restaurant-kitchen", name: "Legacy Kitchen" },
  ],
};

const DOMAIN_LABELS = {
  admin: "Admin Page",
  customer: "Customer Page",
  hotels: "Hotel Ops",
  dining: "Restaurant Ops",
};

const DOMAIN_ROLES = {
  admin: "Master Admin",
  customer: "Customer",
  hotels: "Hotel Manager",
  dining: "Restaurant Manager",
};

const ROOM_TYPES = [
  "Standard Room", "Deluxe Room", "Suite", "Cottage", "Family Room",
  "Twin Room", "Single Room", "Premium Suite", "Dormitory", "Manual Entry",
];

const AIRPORTS = [
  ["DEL","Indira Gandhi International Airport","Delhi","Delhi"],
  ["BOM","Chhatrapati Shivaji Maharaj International Airport","Mumbai","Maharashtra"],
  ["BLR","Kempegowda International Airport","Bengaluru","Karnataka"],
  ["MAA","Chennai International Airport","Chennai","Tamil Nadu"],
  ["CCU","Netaji Subhas Chandra Bose International Airport","Kolkata","West Bengal"],
  ["HYD","Rajiv Gandhi International Airport","Hyderabad","Telangana"],
  ["AMD","Sardar Vallabhbhai Patel International Airport","Ahmedabad","Gujarat"],
  ["PNQ","Pune Airport","Pune","Maharashtra"],
  ["GOX","Manohar International Airport","Mopa","Goa"],
  ["GOI","Dabolim Airport","Dabolim","Goa"],
  ["COK","Cochin International Airport","Kochi","Kerala"],
  ["JAI","Jaipur International Airport","Jaipur","Rajasthan"],
  ["LKO","Chaudhary Charan Singh International Airport","Lucknow","Uttar Pradesh"],
  ["IXC","Shaheed Bhagat Singh International Airport","Chandigarh","Chandigarh"],
  ["SXR","Srinagar International Airport","Srinagar","Jammu and Kashmir"],
  ["TRV","Thiruvananthapuram International Airport","Thiruvananthapuram","Kerala"],
  ["BBI","Biju Patnaik International Airport","Bhubaneswar","Odisha"],
  ["IXB","Bagdogra Airport","Siliguri","West Bengal"],
  ["RPR","Swami Vivekananda Airport","Raipur","Chhattisgarh"],
  ["GAU","Lokpriya Gopinath Bordoloi International Airport","Guwahati","Assam"],
  ["PAT","Jay Prakash Narayan Airport","Patna","Bihar"],
  ["VNS","Lal Bahadur Shastri International Airport","Varanasi","Uttar Pradesh"],
  ["IDR","Devi Ahilya Bai Holkar Airport","Indore","Madhya Pradesh"],
  ["NAG","Dr. Babasaheb Ambedkar International Airport","Nagpur","Maharashtra"],
  ["IXR","Birsa Munda Airport","Ranchi","Jharkhand"],
  ["IXU","Chhatrapati Sambhajinagar Airport","Aurangabad","Maharashtra"],
].map(([code, name, city, state]) => ({ code, name, city, state }));

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80",
];

const RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
];

const DEMO_PLACES = [
  { id: 1, name: "Magnolia Sunset Point", area: "Netarhat", duration: "2h", tags: ["sunset","viewpoint"] },
  { id: 2, name: "Netarhat Dam", area: "Netarhat", duration: "1.5h", tags: ["water","walk"] },
  { id: 3, name: "Upper Ghaghri Falls", area: "Latehar", duration: "2h", tags: ["waterfall"] },
  { id: 4, name: "Pine Forest Trail", area: "Netarhat", duration: "2.5h", tags: ["nature","walk"] },
  { id: 5, name: "Koel View Point", area: "Netarhat", duration: "1h", tags: ["viewpoint"] },
  { id: 6, name: "Local Craft Market", area: "Netarhat Bazaar", duration: "1h", tags: ["shopping"] },
];

// ─── In-memory fallback store ───
const memory = {
  users: [], hotels: [], restaurants: [], bookings: [], trips: [], events: [],
  hotel_profiles: [], hotel_rooms: [], hotel_bookings: [], hotel_services: [], restaurant_orders: [],
  control_items: [],
  next: { users:1, hotels:1, restaurants:1, bookings:1, trips:1, events:1,
          hotel_profiles:1, hotel_rooms:1, hotel_bookings:1, hotel_services:1, restaurant_orders:1, control_items:1 },
};

// ─── Utilities ───
function publicUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const candidate = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

function nowIso() { return new Date().toISOString(); }
function nowPg() { return new Date(); }

function serviceTimer(createdAt, slaMins) {
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  const remaining = slaMins - elapsed;
  if (remaining < 0) return { timer: `+${Math.abs(remaining)}m over`, sla_state: "SLA OVER" };
  return { timer: `${remaining}m left`, sla_state: "On Track" };
}

async function query(sql, params = []) {
  if (!pool) throw new Error("Postgres is not configured.");
  const result = await pool.query(sql, params);
  return result.rows;
}

// ─── Webhook & Event System ───
async function emitEvent(eventType, payload) {
  const event = {
    event_id: crypto.randomUUID(),
    event_type: eventType,
    event_version: "1.0",
    created_at: new Date().toISOString(),
    source: { service: "nhpl-platform", region: "local" },
    payload
  };

  await addEvent("info", `Event: ${eventType} - ${JSON.stringify(payload).slice(0, 50)}...`);

  if (pool) {
    const subs = await query("SELECT * FROM webhook_subscriptions WHERE active = true");
    for (const sub of subs) {
      const isMatch = sub.events.some(e => 
        e === eventType || (e.endsWith(".*") && eventType.startsWith(e.slice(0, -2)))
      );
      if (isMatch) {
        // Fire and forget for this prototype
        deliverWebhook(sub, event).catch(console.error);
      }
    }
  }
}

async function deliverWebhook(sub, event) {
  const body = JSON.stringify(event);
  const signature = crypto.createHmac("sha256", sub.secret).update(body).digest("hex");
  try {
    const res = await fetch(sub.target_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Event-Id": event.event_id,
        "X-Event-Type": event.event_type,
        "X-Signature": `sha256=${signature}`,
        "X-Timestamp": event.created_at
      },
      body,
      signal: AbortSignal.timeout(5000)
    });
    await query(
      "INSERT INTO webhook_deliveries (subscription_id, event_type, payload, status_code, last_attempt) VALUES ($1, $2, $3, $4, now())",
      [sub.id, event.event_type, body, res.status]
    );
  } catch (err) {
    await query(
      "INSERT INTO webhook_deliveries (subscription_id, event_type, payload, status_code, last_attempt) VALUES ($1, $2, $3, $4, now())",
      [sub.id, event.event_type, body, 0]
    );
  }
}

// ─── DB init ───
async function initPostgres() {
  if (!pool) return;
  await query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      default_domain TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      hotel_id INTEGER,
      hotel_role TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS hotels (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      rating NUMERIC NOT NULL DEFAULT 4.5,
      price INTEGER NOT NULL DEFAULT 4500,
      images JSONB NOT NULL DEFAULT '[]',
      amenities JSONB NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS restaurants (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      area TEXT NOT NULL DEFAULT '',
      rating NUMERIC NOT NULL DEFAULT 4.4,
      images JSONB NOT NULL DEFAULT '[]',
      menu JSONB NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS customer_bookings (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      item_id INTEGER,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS trip_plans (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      days INTEGER NOT NULL DEFAULT 1,
      schedule TEXT NOT NULL DEFAULT 'Today',
      places JSONB NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Planned',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS hotel_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS hotel_rooms (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      room_no TEXT NOT NULL,
      room_type TEXT NOT NULL DEFAULT 'Standard Room',
      floor TEXT NOT NULL DEFAULT '1',
      rate NUMERIC NOT NULL DEFAULT 3000,
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Vacant',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS hotel_bookings (
      id SERIAL PRIMARY KEY,
      hotel_user_id INTEGER NOT NULL,
      room_id INTEGER,
      room_no TEXT NOT NULL DEFAULT '',
      guest_name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      check_in TEXT NOT NULL DEFAULT '',
      check_out TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Confirmed',
      ref TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS hotel_services (
      id SERIAL PRIMARY KEY,
      hotel_user_id INTEGER NOT NULL,
      room_id INTEGER,
      room_no TEXT NOT NULL DEFAULT '',
      service_type TEXT NOT NULL,
      title TEXT NOT NULL,
      sla_minutes INTEGER NOT NULL DEFAULT 15,
      priority TEXT NOT NULL DEFAULT 'Normal',
      status TEXT NOT NULL DEFAULT 'Open',
      assignee TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS restaurant_orders (
      id SERIAL PRIMARY KEY,
      customer TEXT NOT NULL,
      table_no TEXT NOT NULL,
      items TEXT NOT NULL,
      total NUMERIC NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'New',
      ref TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS control_items (
      id SERIAL PRIMARY KEY,
      domain TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      enabled BOOLEAN NOT NULL DEFAULT true,
      status TEXT NOT NULL DEFAULT 'Ready',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// ─── Seed ───
async function seedData() {
  const passwordHash = hashPassword(SEED_PASSWORD);
  if (pool) {
    const users = await query("SELECT COUNT(*)::int AS count FROM app_users");
    const seedUsers = [["Apex Admin","admin@apex.local","admin","Master Admin"]];
    if (ENABLE_DEMO_DATA) {
      seedUsers.push(
        ["NHPL Customer","customer@nhpl.local","customer","Customer"],
        ["Hotel Ops","hotel@apex.local","hotels","Hotel Manager"],
        ["Dining Ops","dining@apex.local","dining","Restaurant Manager"],
        ["Logistics Ops","logistics@apex.local","logistics","Dispatch Lead"],
        ["Driver Partner","driver@apex.local","driver","Driver Partner"],
        ["Travel Desk","travel@apex.local","travel","Travel Concierge"],
      );
    }
    for (const [name, email, domain, role] of seedUsers) {
      const existing = await query("SELECT id FROM app_users WHERE lower(email) = lower($1)", [email]);
      if (!existing.length) {
        await query(
          "INSERT INTO app_users (name,email,password_hash,default_domain,role,status) VALUES ($1,$2,$3,$4,$5,'active')",
          [name, email, passwordHash, domain, role],
        );
      }
    }
    const hotels = await query("SELECT COUNT(*)::int AS count FROM hotels");
    if (ENABLE_DEMO_DATA && !hotels[0].count) {
      await query(
        `INSERT INTO hotels (name,address,description,rating,price,images,amenities) VALUES
        ($1,$2,$3,4.8,6200,$4,$5),($6,$7,$8,4.6,4100,$9,$10),($11,$12,$13,4.7,5300,$14,$15)`,
        [
          "NHPL Hill Retreat","Magnolia Road, Netarhat","Premium valley-view rooms with curated food and guided local travel.",
          JSON.stringify(HOTEL_IMAGES),JSON.stringify(["Breakfast","Valley view","Cab pickup","Bonfire"]),
          "Pine Grove Stay","Forest Trail, Netarhat","Quiet family stay near pine trails and sunrise routes.",
          JSON.stringify(HOTEL_IMAGES.slice().reverse()),JSON.stringify(["Family rooms","Parking","Local guide"]),
          "Koel View Residency","Koel View Point Road","Comfort-focused rooms for short official and leisure stays.",
          JSON.stringify([HOTEL_IMAGES[1],HOTEL_IMAGES[0]]),JSON.stringify(["Restaurant","Room service","Airport transfer"]),
        ],
      );
    }
    const rests = await query("SELECT COUNT(*)::int AS count FROM restaurants");
    if (ENABLE_DEMO_DATA && !rests[0].count) {
      await query(
        `INSERT INTO restaurants (name,area,rating,images,menu) VALUES ($1,$2,4.7,$3,$4),($5,$6,4.5,$7,$8)`,
        [
          "NHPL Terrace Dining","Netarhat",JSON.stringify(RESTAURANT_IMAGES),
          JSON.stringify([{name:"Jharkhand Thali",price:449},{name:"Smoked Paneer Tikka",price:329},{name:"Millet Kheer",price:199}]),
          "Pine Cafe","Netarhat Bazaar",JSON.stringify(RESTAURANT_IMAGES.slice().reverse()),
          JSON.stringify([{name:"Forest Herb Soup",price:179},{name:"Grilled Sandwich",price:249},{name:"Masala Tea",price:69}]),
        ],
      );
    }
    const ctrl = await query("SELECT COUNT(*)::int AS count FROM control_items");
    if (ENABLE_DEMO_DATA && !ctrl[0].count) {
      const defaults = [
        ["global","Account Management","Enable new account signups","Allow new users to self-register",true,"Ready"],
        ["global","Security","Force 2FA for all admin accounts","All admin accounts require 2-factor auth",false,"Needs Review"],
        ["global","Audit","Log all API events","Writes every request to events table",true,"Active"],
        ["hotels","Booking","Allow offline room bookings","Front desk can book rooms without payment",true,"Ready"],
        ["hotels","Housekeeping","Auto-assign housekeeping on checkout","Queue housekeeping ticket automatically",true,"Active"],
        ["dining","Orders","Auto-print kitchen tickets","Send order to kitchen printer on submit",false,"Paused"],
        ["dining","Dispatch","Enable real-time order tracking","Customers can track order status",true,"Active"],
        ["transport","Routing","Auto-assign nearest driver","Assigns trip to nearest online driver",true,"Active"],
        ["customer","Marketplace","Show hotel ratings","Display star ratings on listings",true,"Active"],
      ];
      for (const [domain,category,title,detail,enabled,status] of defaults) {
        await query(
          "INSERT INTO control_items (domain,category,title,detail,enabled,status) VALUES ($1,$2,$3,$4,$5,$6)",
          [domain,category,title,detail,enabled,status],
        );
      }
    }
    return;
  }

  // In-memory seed
  if (!memory.users.length) {
    const seedUsers = [["Apex Admin","admin@apex.local","admin","Master Admin"]];
    if (ENABLE_DEMO_DATA) {
      seedUsers.push(
        ["NHPL Customer","customer@nhpl.local","customer","Customer"],
        ["Hotel Ops","hotel@apex.local","hotels","Hotel Manager"],
        ["Dining Ops","dining@apex.local","dining","Restaurant Manager"],
        ["Logistics Ops","logistics@apex.local","logistics","Dispatch Lead"],
        ["Driver Partner","driver@apex.local","driver","Driver Partner"],
        ["Travel Desk","travel@apex.local","travel","Travel Concierge"],
      );
    }
    for (const [name,email,domain,role] of seedUsers) {
      memory.users.push({ id:memory.next.users++, name, email, password_hash:passwordHash, default_domain:domain, role, status:"active", created_at:nowIso(), hotel_id:null, hotel_role:"" });
    }
  }
  if (ENABLE_DEMO_DATA && !memory.hotels.length) {
    memory.hotels.push(
      {id:memory.next.hotels++,name:"NHPL Hill Retreat",address:"Magnolia Road, Netarhat",description:"Premium valley-view rooms.",rating:4.8,price:6200,images:HOTEL_IMAGES,amenities:["Breakfast","Valley view"]},
      {id:memory.next.hotels++,name:"Pine Grove Stay",address:"Forest Trail, Netarhat",description:"Quiet family stay.",rating:4.6,price:4100,images:HOTEL_IMAGES.slice().reverse(),amenities:["Family rooms","Parking"]},
    );
  }
  if (ENABLE_DEMO_DATA && !memory.restaurants.length) {
    memory.restaurants.push(
      {id:memory.next.restaurants++,name:"NHPL Terrace Dining",area:"Netarhat",rating:4.7,images:RESTAURANT_IMAGES,menu:[{name:"Jharkhand Thali",price:449},{name:"Millet Kheer",price:199}]},
      {id:memory.next.restaurants++,name:"Pine Cafe",area:"Netarhat Bazaar",rating:4.5,images:RESTAURANT_IMAGES.slice().reverse(),menu:[{name:"Forest Herb Soup",price:179},{name:"Masala Tea",price:69}]},
    );
  }
  if (ENABLE_DEMO_DATA && !memory.control_items.length) {
    const defaults = [
      ["global","Account Management","Enable new account signups","Allow new users to self-register",true,"Ready"],
      ["global","Security","Force 2FA for all admin accounts","All admin accounts require 2-factor auth",false,"Needs Review"],
      ["hotels","Booking","Allow offline room bookings","Front desk can book rooms without payment",true,"Ready"],
      ["dining","Orders","Auto-print kitchen tickets","Send order to kitchen printer on submit",false,"Paused"],
      ["transport","Routing","Auto-assign nearest driver","Assigns trip to nearest online driver",true,"Active"],
      ["customer","Marketplace","Show hotel ratings","Display star ratings on listings",true,"Active"],
    ];
    for (const [domain,category,title,detail,enabled,status] of defaults) {
      memory.control_items.push({id:memory.next.control_items++,domain,category,title,detail,enabled,status,created_at:nowIso()});
    }
  }
}

// ─── Data helpers ───
async function getUsers() {
  return pool ? query("SELECT * FROM app_users ORDER BY id") : memory.users;
}
async function findUserByEmail(email) {
  if (pool) { const r = await query("SELECT * FROM app_users WHERE lower(email)=lower($1)",[email]); return r[0]||null; }
  return memory.users.find(u=>u.email.toLowerCase()===email.toLowerCase())||null;
}
async function createUser(payload) {
  const passwordHash = hashPassword(payload.password);
  if (pool) {
    const r = await query(
      `INSERT INTO app_users (name,email,password_hash,default_domain,role,status,hotel_id,hotel_role)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id,name,email,default_domain,role,status,created_at,hotel_id,hotel_role`,
      [payload.name,payload.email,passwordHash,payload.domain,payload.role,payload.status,payload.hotel_id||null,payload.hotel_role||""],
    );
    return r[0];
  }
  const user = { id:memory.next.users++, name:payload.name, email:payload.email, password_hash:passwordHash,
    default_domain:payload.domain, role:payload.role, status:payload.status,
    created_at:nowIso(), hotel_id:payload.hotel_id||null, hotel_role:payload.hotel_role||"" };
  memory.users.push(user);
  return publicUser(user);
}
async function getHotels() {
  return pool ? query("SELECT * FROM hotels ORDER BY id") : memory.hotels;
}
async function getRestaurants() {
  return pool ? query("SELECT * FROM restaurants ORDER BY id") : memory.restaurants;
}
async function addEvent(level, message) {
  if (pool) { await query("INSERT INTO events (level,message) VALUES ($1,$2)",[level,message]); }
  else { memory.events.unshift({id:memory.next.events++,level,message,created_at:nowIso()}); }
}
async function getEvents() {
  return pool ? query("SELECT * FROM events ORDER BY id DESC LIMIT 12") : memory.events.slice(0,12);
}
async function getTrips() {
  return pool ? query("SELECT * FROM trip_plans ORDER BY id DESC") : memory.trips.slice().reverse();
}
async function createTrip(payload) {
  if (pool) {
    const r = await query(
      "INSERT INTO trip_plans (title,days,schedule,places,notes,status) VALUES ($1,$2,$3,$4,$5,'Planned') RETURNING *",
      [payload.title,payload.days,payload.schedule,JSON.stringify(payload.places||[]),payload.notes||""],
    );
    return r[0];
  }
  const trip = { id:memory.next.trips++, title:payload.title, days:payload.days, schedule:payload.schedule,
    places:payload.places||[], notes:payload.notes||"", status:"Planned", created_at:nowIso() };
  memory.trips.push(trip);
  return trip;
}
async function createBooking(payload) {
  if (pool) {
    const r = await query(
      `INSERT INTO customer_bookings (type,item_id,customer_name,phone,date,notes,status)
       VALUES ($1,$2,$3,$4,$5,$6,'Confirmed') RETURNING *`,
      [payload.type,payload.item_id||null,payload.customer_name,payload.phone||"",payload.date||"",payload.notes||""],
    );
    return r[0];
  }
  const booking = { id:memory.next.bookings++, status:"Confirmed", created_at:nowIso(), ...payload };
  memory.bookings.push(booking);
  return booking;
}

// ─── Hotel profile helpers ───
async function getHotelProfile(userId) {
  if (pool) {
    const r = await query("SELECT * FROM hotel_profiles WHERE user_id=$1",[userId]);
    return r[0]||null;
  }
  return memory.hotel_profiles.find(p=>p.user_id===userId)||null;
}
async function upsertHotelProfile(payload) {
  if (pool) {
    const r = await query(
      `INSERT INTO hotel_profiles (user_id,name,address,phone,description,cover_image,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,now())
       ON CONFLICT (user_id) DO UPDATE SET name=$2,address=$3,phone=$4,description=$5,
       cover_image=CASE WHEN $6='' THEN hotel_profiles.cover_image ELSE $6 END, updated_at=now()
       RETURNING *`,
      [payload.user_id,payload.name||"",payload.address||"",payload.phone||"",payload.description||"",payload.cover_image||""],
    );
    return r[0];
  }
  let p = memory.hotel_profiles.find(x=>x.user_id===payload.user_id);
  if (p) {
    Object.assign(p, { name:payload.name||p.name, address:payload.address||p.address,
      phone:payload.phone||p.phone, description:payload.description||p.description,
      cover_image:payload.cover_image||p.cover_image, updated_at:nowIso() });
  } else {
    p = { id:memory.next.hotel_profiles++, user_id:payload.user_id, name:payload.name||"",
      address:payload.address||"", phone:payload.phone||"", description:payload.description||"",
      cover_image:payload.cover_image||"", updated_at:nowIso() };
    memory.hotel_profiles.push(p);
  }
  return p;
}
async function getHotelRooms(userId) {
  if (pool) return query("SELECT * FROM hotel_rooms WHERE user_id=$1 ORDER BY id",[userId]);
  return memory.hotel_rooms.filter(r=>r.user_id===userId);
}
async function addHotelRoom(payload) {
  if (pool) {
    const r = await query(
      `INSERT INTO hotel_rooms (user_id,room_no,room_type,floor,rate,description,image_url,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Vacant') RETURNING *`,
      [payload.user_id,payload.room_no,payload.room_type||"Standard Room",payload.floor||"1",
       Number(payload.rate)||3000,payload.description||"",payload.image_url||""],
    );
    return r[0];
  }
  const room = { id:memory.next.hotel_rooms++, user_id:payload.user_id, room_no:payload.room_no,
    room_type:payload.room_type||"Standard Room", floor:payload.floor||"1", rate:Number(payload.rate)||3000,
    description:payload.description||"", image_url:payload.image_url||"", status:"Vacant", created_at:nowIso() };
  memory.hotel_rooms.push(room);
  return room;
}
async function getHotelBookings(userId) {
  if (pool) return query("SELECT * FROM hotel_bookings WHERE hotel_user_id=$1 ORDER BY id DESC LIMIT 20",[userId]);
  return memory.hotel_bookings.filter(b=>b.hotel_user_id===userId).slice().reverse().slice(0,20);
}
async function addHotelBooking(payload) {
  const ref = "HB-" + String(Date.now()).slice(-6);
  if (pool) {
    if (payload.room_id) await query("UPDATE hotel_rooms SET status='Occupied' WHERE id=$1",[payload.room_id]);
    const r = await query(
      `INSERT INTO hotel_bookings (hotel_user_id,room_id,room_no,guest_name,phone,check_in,check_out,notes,status,ref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Confirmed',$9) RETURNING *`,
      [payload.hotel_user_id,payload.room_id||null,payload.room_no||"",payload.guest_name,
       payload.phone||"",payload.check_in||"",payload.check_out||"",payload.notes||"",ref],
    );
    return r[0];
  }
  if (payload.room_id) {
    const room = memory.hotel_rooms.find(r=>r.id===Number(payload.room_id));
    if (room) room.status = "Occupied";
  }
  const bk = { id:memory.next.hotel_bookings++, hotel_user_id:payload.hotel_user_id, room_id:payload.room_id||null,
    room_no:payload.room_no||"", guest_name:payload.guest_name, phone:payload.phone||"",
    check_in:payload.check_in||"", check_out:payload.check_out||"", notes:payload.notes||"",
    status:"Confirmed", ref, created_at:nowIso() };
  memory.hotel_bookings.push(bk);
  return bk;
}
async function getHotelServices(userId) {
  if (pool) return query("SELECT * FROM hotel_services WHERE hotel_user_id=$1 ORDER BY id DESC",[userId]);
  return memory.hotel_services.filter(s=>s.hotel_user_id===userId).slice().reverse();
}
async function addHotelService(payload) {
  if (pool) {
    const r = await query(
      `INSERT INTO hotel_services (hotel_user_id,room_id,room_no,service_type,title,sla_minutes,priority,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Open') RETURNING *`,
      [payload.hotel_user_id,payload.room_id||null,payload.room_no||"",payload.service_type||"Housekeeping",
       payload.title,Number(payload.sla_minutes)||15,payload.priority||"Normal"],
    );
    return r[0];
  }
  const svc = { id:memory.next.hotel_services++, hotel_user_id:payload.hotel_user_id, room_id:payload.room_id||null,
    room_no:payload.room_no||"", service_type:payload.service_type||"Housekeeping", title:payload.title,
    sla_minutes:Number(payload.sla_minutes)||15, priority:payload.priority||"Normal",
    status:"Open", assignee:"", created_at:nowIso() };
  memory.hotel_services.push(svc);
  return svc;
}
async function updateHotelServiceStatus(ticketId, action, assignee) {
  const statusMap = { assign:"Assigned", done:"Done", escalate:"Critical" };
  const newStatus = statusMap[action] || "Open";
  if (pool) {
    await query("UPDATE hotel_services SET status=$1, assignee=$2 WHERE id=$3",[newStatus,assignee||"",ticketId]);
    return;
  }
  const svc = memory.hotel_services.find(s=>s.id===Number(ticketId));
  if (svc) { svc.status = newStatus; svc.assignee = assignee||""; }
}
async function getHotelEmployees(userId) {
  if (pool) return query("SELECT id,name,email,role,hotel_role,status FROM app_users WHERE hotel_id=$1 ORDER BY id",[userId]);
  return memory.users.filter(u=>u.hotel_id===userId);
}

// ─── NEW: Get all live hotels — merges hotel_profiles (created by hotel ops) + hotels (seed/admin) ───
async function getAllLiveHotels() {
  // Seed/admin hotels
  const seedHotels = await getHotels();

  // Hotels created via Hotel Setup (hotel_profiles) — include their rooms for availability
  let profiles = [];
  if (pool) {
    profiles = await query(`
      SELECT hp.*, u.name as manager_name,
        COUNT(hr.id) FILTER (WHERE hr.status='Vacant') AS vacant_count,
        COUNT(hr.id) AS room_count,
        MIN(hr.rate) AS min_rate,
        (SELECT hr2.image_url FROM hotel_rooms hr2 WHERE hr2.user_id=hp.user_id AND hr2.image_url!='' LIMIT 1) AS room_image
      FROM hotel_profiles hp
      JOIN app_users u ON u.id=hp.user_id
      LEFT JOIN hotel_rooms hr ON hr.user_id=hp.user_id
      WHERE hp.name != ''
      GROUP BY hp.id, hp.user_id, hp.name, hp.address, hp.phone, hp.description, hp.cover_image, hp.updated_at, u.name
    `);
  } else {
    for (const p of memory.hotel_profiles) {
      if (!p.name) continue;
      const rooms = memory.hotel_rooms.filter(r=>r.user_id===p.user_id);
      const vacantCount = rooms.filter(r=>r.status==="Vacant").length;
      const minRate = rooms.length ? Math.min(...rooms.map(r=>Number(r.rate))) : 0;
      const roomImage = rooms.find(r=>r.image_url)?.image_url || "";
      const manager = memory.users.find(u=>u.id===p.user_id);
      profiles.push({ ...p, manager_name:manager?.name||"", vacant_count:vacantCount, room_count:rooms.length, min_rate:minRate, room_image:roomImage });
    }
  }

  // Convert profiles to hotel-shaped objects so the customer page can display them uniformly
  const profileHotels = profiles.map(p => ({
    id: `profile-${p.user_id}`,
    name: p.name,
    address: p.address || "Netarhat, Jharkhand",
    description: p.description || `Managed by ${p.manager_name}. ${p.vacant_count} room(s) available.`,
    rating: 4.5,
    price: p.min_rate || 3000,
    images: [p.cover_image || p.room_image || HOTEL_IMAGES[0]],
    amenities: [],
    vacant_rooms: Number(p.vacant_count) || 0,
    total_rooms: Number(p.room_count) || 0,
    phone: p.phone || "",
    is_live: true,   // flag so customer page can show "Live" badge
    profile_user_id: p.user_id,
  }));

  // De-duplicate: if a profile hotel has same name as a seed hotel, prefer profile (it's real)
  const profileNames = new Set(profileHotels.map(h=>h.name.trim().toLowerCase()));
  const filteredSeed = seedHotels.filter(h=>!profileNames.has(h.name.trim().toLowerCase()));

  return [...profileHotels, ...filteredSeed];
}

// ─── Restaurant helpers ───
function orderRef() { return "ORD-" + String(Date.now()).slice(-5); }
async function getRestaurantOrders() {
  if (pool) return query("SELECT * FROM restaurant_orders ORDER BY id DESC LIMIT 30");
  return memory.restaurant_orders.slice().reverse().slice(0,30);
}
async function addRestaurantOrder(payload) {
  const ref = orderRef();
  if (pool) {
    const r = await query(
      "INSERT INTO restaurant_orders (customer,table_no,items,total,status,ref) VALUES ($1,$2,$3,$4,'New',$5) RETURNING *",
      [payload.customer,payload.table_no,payload.items,Number(payload.total)||0,ref],
    );
    return r[0];
  }
  const order = { id:memory.next.restaurant_orders++, customer:payload.customer, table_no:payload.table_no,
    items:payload.items, total:Number(payload.total)||0, status:"New", ref, created_at:nowIso() };
  memory.restaurant_orders.push(order);
  return order;
}
async function updateOrderStatus(orderId, status) {
  if (pool) { await query("UPDATE restaurant_orders SET status=$1 WHERE id=$2",[status,orderId]); return; }
  const o = memory.restaurant_orders.find(x=>x.id===Number(orderId));
  if (o) o.status = status;
}

// ─── Control system helpers ───
async function getControlItems(domain) {
  if (pool) return query("SELECT * FROM control_items WHERE domain=$1 ORDER BY id",[domain]);
  return memory.control_items.filter(c=>c.domain===domain);
}
async function upsertControlItem(payload) {
  if (payload.id && payload.id !== "new") {
    if (pool) {
      const r = await query(
        "UPDATE control_items SET title=$1,detail=$2,enabled=$3,status=$4 WHERE id=$5 RETURNING *",
        [payload.title,payload.detail||"",payload.enabled===true||payload.enabled==="true"||payload.enabled==="on",payload.status||"Ready",payload.id],
      );
      return r[0];
    }
    const item = memory.control_items.find(c=>c.id===Number(payload.id));
    if (item) Object.assign(item,{title:payload.title,detail:payload.detail||"",
      enabled:payload.enabled===true||payload.enabled==="true"||payload.enabled==="on",status:payload.status||"Ready"});
    return item;
  }
  if (pool) {
    const r = await query(
      "INSERT INTO control_items (domain,category,title,detail,enabled,status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [payload.domain||"global",payload.category||"Custom",payload.title,payload.detail||"",true,"Ready"],
    );
    return r[0];
  }
  const item = { id:memory.next.control_items++, domain:payload.domain||"global", category:payload.category||"Custom",
    title:payload.title, detail:payload.detail||"", enabled:true, status:"Ready", created_at:nowIso() };
  memory.control_items.push(item);
  return item;
}

// ─── Payloads ───
function domainsPayload() {
  return { domains: Object.entries(DOMAIN_LABELS).map(([id,name])=>({id,name,
    icon:id==="customer"?"travel_explore":"dashboard",
    summary:id==="customer"?"Guest trip planning, hotels, dining, cabs, flights, and events.":`${name} workspace`,
    metrics:[{label:"Status",value:"Live"},{label:"Mode",value:pool?"Neon":"Local"}],
  })) };
}

function dashboardPayload() {
  return {
    stats:{ partners:4, activeDrivers:3, pendingRequests:2, auditedPartners:1, assignedTrips:1, uptime:"99.98%" },
    partners:[
      {id:1,name:"NHPL Hill Retreat",sector:"Hotels",metric:"Live",detail:"Bookable customer inventory",status:"Verified"},
      {id:2,name:"NHPL Terrace Dining",sector:"Dining",metric:"Live",detail:"Menu enabled",status:"Verified"},
    ],
    drivers:[
      {id:1,name:"Amit Kumar",role:"Driver",status:"On Duty",location:"Ranchi Airport"},
      {id:2,name:"Ravi Singh",role:"Driver",status:"On Duty",location:"Netarhat"},
    ],
    requests:[{id:1,ref:"TR-1001",traveler:"NHPL Guest",route:"Ranchi Airport → Netarhat",status:"Assigned",priority:1,driver_name:"Amit Kumar"}],
    events: pool ? [] : memory.events,
  };
}

// ─── Express app ───
const app = express();
app.use(express.json({ limit: "8mb" }));
app.use(express.static(PUBLIC_DIR, { etag: false, maxAge: 0 }));

app.get("/api/health", async (_req, res) => {
  res.json({ ok:true, database:pool?"postgres":"memory", neon:Boolean(pool), time:Date.now() });
});

app.get("/api/screens", (req, res) => {
  res.json({ screens: DOMAIN_SCREENS[req.query.domain] || [] });
});

app.get("/api/domains", (_req, res) => res.json(domainsPayload()));
app.get("/api/dashboard", (_req, res) => res.json(dashboardPayload()));
app.get("/api/events", async (_req, res) => res.json({ events: await getEvents() }));

app.get("/api/accounts", async (_req, res) => {
  const accounts = (await getUsers()).map(u=>({ ...publicUser(u), domain_label:DOMAIN_LABELS[u.default_domain]||u.default_domain }));
  res.json({ accounts });
});

app.post("/api/accounts/status", async (req, res) => {
  const status = String(req.body.status||"");
  const userId = Number(req.body.user_id);
  if (!["active","disabled"].includes(status)||!userId) return res.status(400).json({ error:"Select a valid account status." });
  if (pool) { await query("UPDATE app_users SET status=$1 WHERE id=$2",[status,userId]); }
  else { const u=memory.users.find(x=>x.id===userId); if(u) u.status=status; }
  await addEvent("info",`Account ${userId} changed to ${status}.`);
  res.json({ ok:true });
});

app.delete("/api/accounts/:id", async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) return res.status(400).json({ error: "Invalid user ID" });
  if (pool) {
    await query("DELETE FROM app_users WHERE id = $1", [userId]);
  } else {
    memory.users = memory.users.filter(u => u.id !== userId);
  }
  await addEvent("warning", `Account ${userId} was deleted.`);
  res.json({ ok: true });
});

app.post("/api/login", async (req, res) => {
  try {
    const email = String(req.body.email||"").trim().toLowerCase();
    const password = String(req.body.password||"");
    const domain = String(req.body.domain||"customer");
    const user = await findUserByEmail(email);
    if (!user||!verifyPassword(password,user.password_hash)) return res.status(401).json({ error:"Invalid email or password." });
    if (user.status!=="active") return res.status(403).json({ error:"This account is not active." });
    if (domain!==user.default_domain) return res.status(403).json({ error:`This account is assigned to ${DOMAIN_LABELS[user.default_domain]}.` });
    const safe = { ...publicUser(user), selected_domain:user.default_domain, token:crypto.randomBytes(18).toString("hex") };
    await addEvent("info",`${safe.name} signed in to ${safe.default_domain}.`);
    res.json({ user:safe, ...domainsPayload() });
  } catch (error) { res.status(500).json({ error:error.message }); }
});

app.post("/api/signup", async (req, res) => {
  try {
    const name = String(req.body.name||"").trim();
    const email = String(req.body.email||"").trim().toLowerCase();
    const password = String(req.body.password||"");
    const domain = String(req.body.domain||"customer");
    if (!name||!email||!password) return res.status(400).json({ error:"Name, email, and password are required." });
    if (!DOMAIN_SCREENS[domain]) return res.status(400).json({ error:"Select a valid account category." });
    if (await findUserByEmail(email)) return res.status(409).json({ error:"An account already exists for this email." });
    const status = ["admin","customer"].includes(domain) ? "active" : "pending";
    const user = await createUser({ name, email, password, domain, role:DOMAIN_ROLES[domain], status });
    await addEvent(status==="active"?"success":"warning",`${name} created a ${DOMAIN_LABELS[domain]} account.`);
    res.status(201).json({
      message:status==="active"?"Account created and activated.":"Account created. Admin approval is required before sign in.",
      user:status==="active"?{ ...user, selected_domain:domain, token:crypto.randomBytes(18).toString("hex") }:null,
    });
  } catch (error) { res.status(500).json({ error:error.message }); }
});

app.get("/api/airports", (_req, res) => res.json({ airports: AIRPORTS }));
app.get("/api/demo-places", (_req, res) => res.json({ places: DEMO_PLACES }));

// ─── UPDATED: /api/explore now returns live hotel_profiles merged with seed hotels ───
app.get("/api/explore", async (req, res) => {
  const category = String(req.query.category||"").toLowerCase();
  if (category==="flights") return res.json({ category, airports:AIRPORTS });
  if (category==="hotels") {
    const hotels = await getAllLiveHotels();
    return res.json({ category, hotels });
  }
  if (category==="dining") return res.json({ category, restaurants:await getRestaurants() });
  if (category==="cabs") return res.json({ category, places:DEMO_PLACES, schedules:["Today","Tomorrow"] });
  if (category==="events") return res.json({ category, trips:await getTrips() });
  res.status(404).json({ error:"Unknown marketplace category." });
});

app.get("/api/trips", async (req, res) => {
  if (pool) {
    const trips = await query(`
      SELECT t.*, d.bio as driver_bio, g.bio as guide_bio, u.name as customer_name
      FROM trips t
      LEFT JOIN providers d ON d.id = t.driver_id
      LEFT JOIN providers g ON g.id = t.guide_id
      LEFT JOIN app_users u ON u.id = t.customer_id
      ORDER BY t.id DESC
    `);
    return res.json({ trips, places: DEMO_PLACES });
  }
  res.json({ trips: await getTrips(), places: DEMO_PLACES });
});

app.post("/api/trips/request", async (req, res) => {
  const { customer_id, origin, destination, pax, preferences } = req.body;
  if (pool) {
    const [trip] = await query(
      `INSERT INTO trips (customer_id, origin, destination, pax, preferences, status) 
       VALUES ($1, $2, $3, $4, $5, 'requested') RETURNING *`,
      [customer_id || 7, JSON.stringify(origin), JSON.stringify(destination), pax || 1, JSON.stringify(preferences || {})]
    );
    
    // Simulate matching logic: create 2 dummy matches immediately
    const providers = await query("SELECT id, type, rating FROM providers WHERE status = 'available'");
    const drivers = providers.filter(p => p.type === 'driver');
    const guides = providers.filter(p => p.type === 'guide');

    for (const d of drivers.slice(0, 2)) {
      await query(
        "INSERT INTO trip_matches (trip_id, provider_id, eta_mins, price, expires_at) VALUES ($1, $2, $3, $4, now() + interval '5 minutes')",
        [trip.id, d.id, Math.floor(Math.random() * 15) + 5, 1200 + (Math.random() * 200)]
      );
    }
    for (const g of guides.slice(0, 2)) {
      await query(
        "INSERT INTO trip_matches (trip_id, provider_id, eta_mins, price, expires_at) VALUES ($1, $2, $3, $4, now() + interval '5 minutes')",
        [trip.id, g.id, 0, 500 + (Math.random() * 100)]
      );
    }

    await emitEvent("travel.trip.requested", trip);
    return res.json({ trip_id: trip.id, status: "requested" });
  }
  res.status(501).json({ error: "Trip matching requires Postgres mode." });
});

app.get("/api/trips/matches/:id", async (req, res) => {
  if (pool) {
    const matches = await query(
      `SELECT tm.*, p.type, p.vehicle_details, p.rating, u.name as provider_name
       FROM trip_matches tm
       JOIN providers p ON p.id = tm.provider_id
       JOIN app_users u ON u.id = p.user_id
       WHERE tm.trip_id = $1 AND tm.expires_at > now()`,
      [req.params.id]
    );
    return res.json({ matches });
  }
  res.json({ matches: [] });
});

app.post("/api/trips/accept", async (req, res) => {
  const { trip_id, driver_match_id, guide_match_id } = req.body;
  if (pool) {
    const driverMatch = await query("SELECT * FROM trip_matches WHERE id = $1", [driver_match_id]);
    const guideMatch = await query("SELECT * FROM trip_matches WHERE id = $1", [guide_match_id]);
    
    if (!driverMatch[0]) return res.status(404).json({ error: "Driver match not found or expired." });
    
    const driverId = driverMatch[0].provider_id;
    const guideId = guideMatch[0]?.provider_id || null;
    const totalPrice = Number(driverMatch[0].price) + (guideMatch[0] ? Number(guideMatch[0].price) : 0);

    const [trip] = await query(
      `UPDATE trips SET driver_id = $1, guide_id = $2, status = 'assigned', 
       price_breakdown = $3 WHERE id = $4 RETURNING *`,
      [driverId, guideId, JSON.stringify({ driver: driverMatch[0].price, guide: guideMatch[0]?.price || 0, total: totalPrice }), trip_id]
    );

    await query("UPDATE providers SET status = 'on-trip' WHERE id IN ($1, $2)", [driverId, guideId]);
    await emitEvent("travel.trip.assigned", trip);
    
    return res.json({ trip, status: "assigned" });
  }
  res.status(501).json({ error: "Database required." });
});

app.post("/api/bookings", async (req, res) => {
  const type = String(req.body.type||"").trim();
  const customerName = String(req.body.customer_name||"").trim();
  if (!type||!customerName) return res.status(400).json({ error:"Booking type and customer name are required." });
  const booking = await createBooking({ type, item_id:Number(req.body.item_id||0)||null,
    customer_name:customerName, phone:String(req.body.phone||""), date:String(req.body.date||""), notes:String(req.body.notes||"") });
  // ── Cross-domain: if booking is for a live profile hotel, also write to hotel_bookings
  // so the Hotel Manager sees it immediately in their Front Desk panel.
  const profileUserId = Number(req.body.profile_user_id||0)||null;
  if (profileUserId && type === "Hotel") {
    try {
      const rooms = await getHotelRooms(profileUserId);
      const vacant = rooms.find(r=>r.status==="Vacant");
      await addHotelBooking({
        hotel_user_id: profileUserId,
        room_id: vacant?.id || null,
        room_no: vacant?.room_no || "TBD",
        guest_name: customerName,
        phone: String(req.body.phone||""),
        check_in: String(req.body.date||""),
        check_out: "",
        notes: String(req.body.notes||"Booked via customer portal."),
      });
    } catch(_) { /* non-fatal — customer booking is already saved */ }
  }
  await addEvent("success",`${type} booking confirmed for ${customerName}.`);
  res.status(201).json({ booking });
});

// ─── /api/my-bookings — merges customer_bookings + recent hotel_bookings ───
app.get("/api/my-bookings", async (req, res) => {
  try {
    let bookings = [];
    if (pool) {
      // Merge both tables so customers see hotel bookings they made via the portal
      const [cb, hb] = await Promise.all([
        query("SELECT id, type, customer_name, phone, date, notes, status, created_at FROM customer_bookings ORDER BY id DESC LIMIT 20"),
        query(`SELECT id, 'Hotel' AS type, guest_name AS customer_name, phone,
                      check_in AS date, notes, status, created_at
               FROM hotel_bookings ORDER BY id DESC LIMIT 10`),
      ]);
      // De-duplicate by customer_name+date combo (same person may appear in both)
      const seen = new Set();
      for (const b of [...cb, ...hb]) {
        const key = `${(b.customer_name||"").toLowerCase()}|${b.date||""}`;
        if (!seen.has(key)) { seen.add(key); bookings.push(b); }
      }
      bookings.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      bookings = bookings.slice(0, 20);
    } else {
      const cb = memory.bookings.slice().reverse().slice(0, 20)
        .map(b => ({ ...b, type: b.type || "Booking" }));
      const hb = memory.hotel_bookings.slice().reverse().slice(0, 10)
        .map(b => ({ id:b.id, type:"Hotel", customer_name:b.guest_name,
          phone:b.phone, date:b.check_in, notes:b.notes, status:b.status, created_at:b.created_at }));
      const seen = new Set();
      for (const b of [...cb, ...hb]) {
        const key = `${(b.customer_name||"").toLowerCase()}|${b.date||""}`;
        if (!seen.has(key)) { seen.add(key); bookings.push(b); }
      }
      bookings.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      bookings = bookings.slice(0, 20);
    }
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/events", async (req, res) => {
  const message = String(req.body.message||"").trim();
  if (!message) return res.status(400).json({ error:"Message is required." });
  await addEvent(String(req.body.level||"info"), message);
  res.status(201).json(dashboardPayload());
});

// ─── Restaurant Ops ───
app.get("/api/restaurant", async (req, res) => {
  if (pool) {
    const orders = await query(`
      SELECT o.*, u.name as customer_name
      FROM restaurant_orders o
      JOIN app_users u ON u.id = o.customer_id
      ORDER BY o.created_at DESC LIMIT 20
    `);
    const menu = await query("SELECT * FROM menu_items");
    const openOrders = orders.filter(o=>!['served','dispatched'].includes(o.status)).length;
    return res.json({ stats:{ openOrders, preparing: orders.filter(o=>o.status==='preparing').length, ready: orders.filter(o=>o.status==='ready').length, avgPrep:"12m" }, orders, menu });
  }
  const restaurants = await getRestaurants();
  const orders = await getRestaurantOrders();
  res.json({ stats:{ openOrders:0, preparing:0, ready:0, avgPrep:"18m" }, orders, restaurants });
});

app.post("/api/restaurant/orders", async (req, res) => {
  const { customer_id, restaurant_id, mode, items, total } = req.body;
  if (pool) {
    const [order] = await query(
      `INSERT INTO restaurant_orders (customer_id, restaurant_id, mode, items, total_amount, status) 
       VALUES ($1, $2, $3, $4, $5, 'new') RETURNING *`,
      [customer_id || 7, restaurant_id || 1, mode || 'dine-in', JSON.stringify(items), total]
    );

    // Create kitchen ticket
    await query(
      "INSERT INTO kitchen_tickets (order_id, station, items) VALUES ($1, 'main', $2)",
      [order.id, JSON.stringify(items)]
    );

    const [folio] = await query("INSERT INTO folios (customer_id, balance) VALUES ($1, 0) ON CONFLICT (customer_id) DO UPDATE SET balance = folios.balance RETURNING id", [customer_id || 7]);
    await query("INSERT INTO folio_items (folio_id, type, amount, description) VALUES ($1, 'dining', $2, 'Restaurant order')", [folio.id, total]);

    await emitEvent("restaurant.order.created", order);
    return res.json({ order });
  }
  res.status(501).json({ error: "Requires Database." });
});

app.post("/api/restaurant/status", async (req, res) => {
  const orderId = Number(req.body.orderId||req.body.order_id);
  const status = String(req.body.status||"");
  const allowed = ["New","Preparing","Ready","Dispatched","Served"];
  if (!orderId||!allowed.includes(status)) return res.status(400).json({ error:"Invalid order or status." });
  await updateOrderStatus(orderId, status);
  await addEvent("info",`Order ${orderId} moved to ${status}.`);
  const orders = await getRestaurantOrders();
  res.json({ orders, stats:{ openOrders:orders.filter(o=>!["Served","Dispatched"].includes(o.status)).length, preparing:0, ready:0, avgPrep:"18m" } });
});

// ─── Hotel full Ops ───
app.get("/api/hotel", async (req, res) => {
  if (pool) {
    const hotels = await query("SELECT * FROM hotels");
    const rooms = await query("SELECT * FROM hotel_rooms ORDER BY id");
    const bookings = await query(`
      SELECT r.*, u.name as guest_name, u.phone, rm.room_no
      FROM reservations r
      JOIN app_users u ON u.id = r.customer_id
      LEFT JOIN hotel_rooms rm ON rm.id = r.room_id
      ORDER BY r.created_at DESC LIMIT 20
    `);
    return res.json({ hotel:hotels[0]||{}, stats:{ vacant:rooms.length, bookings:bookings.length }, rooms, bookings });
  }
  const userId = Number(req.query.user_id)||null;
  const rooms = await getHotelRooms(userId);
  const bookings = await getHotelBookings(userId);
  const vacant = rooms.filter(r=>r.status==="Vacant").length;
  const occupied = rooms.filter(r=>r.status==="Occupied").length;
  const housekeeping = rooms.filter(r=>r.status==="Housekeeping").length;
  res.json({ hotel:{}, stats:{ vacant, occupied, housekeeping, bookings:bookings.length }, rooms, bookings });
});

app.get("/api/hotel/services", async (req, res) => {
  const userId = Number(req.query.user_id)||null;
  let tickets = userId ? await getHotelServices(userId)
    : pool ? await query("SELECT * FROM hotel_services ORDER BY id DESC LIMIT 30") : memory.hotel_services.slice().reverse().slice(0,30);
  const rooms = userId ? await getHotelRooms(userId) : (pool ? await query("SELECT * FROM hotel_rooms") : memory.hotel_rooms);
  tickets = tickets.map(t=>{
    const room = rooms.find(r=>r.id===t.room_id);
    const { timer, sla_state } = serviceTimer(t.created_at, t.sla_minutes||15);
    return { ...t, room_no:t.room_no||room?.room_no||"?", timer, sla_state };
  });
  const open = tickets.filter(t=>t.status!=="Done").length;
  const critical = tickets.filter(t=>t.status==="Critical").length;
  const done = tickets.filter(t=>t.status==="Done").length;
  res.json({ tickets, stats:{ open, critical, done } });
});

app.post("/api/hotel/services", async (req, res) => {
  const userId = Number(req.body.user_id);
  if (!userId) return res.status(401).json({ error:"Unauthorised." });
  const roomId = Number(req.body.room_id)||null;
  let roomNo = "";
  if (roomId) {
    const rooms = await getHotelRooms(userId);
    roomNo = rooms.find(r=>r.id===roomId)?.room_no || "";
  }
  const svc = await addHotelService({ hotel_user_id:userId, room_id:roomId, room_no:roomNo,
    service_type:req.body.service_type||"Housekeeping", title:String(req.body.title||"Service request"),
    sla_minutes:Number(req.body.sla_minutes)||15, priority:req.body.priority||"Normal" });
  await addEvent("info",`Service: ${svc.service_type} for room ${roomNo||"?"}.`);
  res.status(201).json({ ticket:svc });
});

app.post("/api/hotel/services/status", async (req, res) => {
  const ticketId = Number(req.body.ticket_id);
  const action = String(req.body.action||"");
  const assignee = String(req.body.assignee||"");
  if (!ticketId||!["assign","done","escalate"].includes(action)) return res.status(400).json({ error:"Invalid ticket or action." });
  await updateHotelServiceStatus(ticketId, action, assignee);
  await addEvent("info",`Service ticket ${ticketId}: ${action}.`);
  res.json({ ok:true });
});

app.get("/api/hotel/profile", async (req, res) => {
  const userId = Number(req.query.user_id);
  if (!userId) return res.status(401).json({ error:"Unauthorised." });
  const hotel = await getHotelProfile(userId);
  const rooms = await getHotelRooms(userId);
  const employees = await getHotelEmployees(userId);
  const tickets = (await getHotelServices(userId)).map(t=>{
    const room = rooms.find(r=>r.id===t.room_id);
    const { timer, sla_state } = serviceTimer(t.created_at, t.sla_minutes||15);
    return { ...t, room_no:t.room_no||room?.room_no||"?", timer, sla_state };
  });
  res.json({ hotel, hotelData:{ rooms }, services:{ tickets }, employees, roomTypes:ROOM_TYPES });
});

app.post("/api/hotel/profile", async (req, res) => {
  const userId = Number(req.body.user_id);
  if (!userId) return res.status(401).json({ error:"Unauthorised." });
  const profile = await upsertHotelProfile({ user_id:userId, name:req.body.name||"",
    address:req.body.address||"", phone:req.body.phone||"", description:req.body.description||"",
    cover_image:req.body.cover_image||"" });
  await addEvent("info",`Hotel profile updated by user ${userId}.`);
  res.json({ hotel:profile });
});

app.post("/api/hotel/rooms", async (req, res) => {
  const userId = Number(req.body.user_id);
  if (!userId) return res.status(401).json({ error:"Unauthorised." });
  const roomNo = String(req.body.room_no||"").trim();
  if (!roomNo) return res.status(400).json({ error:"Room number is required." });
  const roomType = req.body.manual_room_type||req.body.room_type||"Standard Room";
  const room = await addHotelRoom({ user_id:userId, room_no:roomNo, room_type:roomType,
    floor:req.body.floor||"1", rate:Number(req.body.rate||3000),
    description:req.body.description||"", image_url:req.body.image_url||"" });
  await addEvent("success",`Room ${roomNo} added to hotel.`);
  res.status(201).json({ room });
});

app.post("/api/hotel/bookings", async (req, res) => {
  const { customer_id, hotel_id, room_id, check_in, check_out, pax } = req.body;
  if (pool) {
    const [resv] = await query(
      `INSERT INTO reservations (customer_id, hotel_id, room_id, check_in, check_out, pax, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'confirmed') RETURNING *`,
      [customer_id || 7, hotel_id, room_id, check_in, check_out, pax || 1]
    );
    if (room_id) await query("UPDATE hotel_rooms SET status = 'Occupied' WHERE id = $1", [room_id]);
    
    // Add to folio
    const [folio] = await query("INSERT INTO folios (customer_id, balance) VALUES ($1, 0) ON CONFLICT (customer_id) DO UPDATE SET balance = folios.balance RETURNING id", [customer_id || 7]);
    await query("INSERT INTO folio_items (folio_id, type, amount, description) VALUES ($1, 'hotel', 5500, 'Room reservation')", [folio.id]);

    await emitEvent("hotel.reservation.created", resv);
    return res.json({ reservation: resv });
  }
  // Fallback...
  const hotelUserId = Number(req.body.user_id)||Number(req.body.hotel_user_id);
  const guestName = String(req.body.guest_name||"").trim();
  if (!guestName) return res.status(400).json({ error:"Guest name is required." });
  const roomId = Number(req.body.room_id)||null;
  let roomNo = req.body.room_no||"";
  if (roomId && !roomNo) {
    const rooms = await getHotelRooms(hotelUserId);
    roomNo = rooms.find(r=>r.id===roomId)?.room_no||"";
  }
  const booking = await addHotelBooking({ hotel_user_id:hotelUserId, room_id:roomId, room_no:roomNo,
    guest_name:guestName, phone:req.body.phone||"", check_in:req.body.check_in||"",
    check_out:req.body.check_out||"", notes:req.body.notes||"" });
  await addEvent("success",`Room ${roomNo} booked for ${guestName}.`);
  res.status(201).json({ booking });
});

app.post("/api/hotel/employees", async (req, res) => {
  const hotelUserId = Number(req.body.user_id);
  if (!hotelUserId) return res.status(401).json({ error:"Unauthorised." });
  const name = String(req.body.name||"").trim();
  const email = String(req.body.email||"").trim().toLowerCase();
  const password = String(req.body.password||"");
  const hotelRole = String(req.body.hotel_role||"Front Desk");
  if (!name||!email||!password) return res.status(400).json({ error:"Name, email and password are required." });
  if (await findUserByEmail(email)) return res.status(409).json({ error:"Email already in use." });
  const emp = await createUser({ name, email, password, domain:"hotels", role:"Hotel Staff", status:"active",
    hotel_id:hotelUserId, hotel_role:hotelRole });
  await addEvent("success",`Employee ${name} created under hotel ${hotelUserId}.`);
  res.status(201).json({ employee:emp });
});

// ─── Control System ───
app.get("/api/control-system", async (req, res) => {
  const domain = String(req.query.domain||"global");
  const items = await getControlItems(domain);
  res.json({ domain, items, stats:{ total:items.length, enabled:items.filter(c=>c.enabled).length,
    disabled:items.filter(c=>!c.enabled).length, attention:items.filter(c=>c.status==="Needs Review").length } });
});

app.post("/api/control-system", async (req, res) => {
  const domain = String(req.body.domain||"global");
  const action = String(req.body.action||"update");
  const item = await upsertControlItem({ id:action==="create"?"new":req.body.id, domain,
    category:req.body.category||"Custom", title:String(req.body.title||"Untitled"),
    detail:String(req.body.detail||""), enabled:req.body.enabled, status:req.body.status||"Ready" });
  await addEvent("info",`Control item ${item.id} updated in ${domain}.`);
  const items = await getControlItems(domain);
  res.json({ domain, items, stats:{ total:items.length, enabled:items.filter(c=>c.enabled).length,
    disabled:items.filter(c=>!c.enabled).length, attention:items.filter(c=>c.status==="Needs Review").length } });
});

// ─── Financials & Folios ───
app.get("/api/folios/:customerId", async (req, res) => {
  if (pool) {
    const [folio] = await query("SELECT * FROM folios WHERE customer_id = $1", [req.params.customerId]);
    if (!folio) return res.json({ items: [], balance: 0 });
    const items = await query("SELECT * FROM folio_items WHERE folio_id = $1 ORDER BY created_at DESC", [folio.id]);
    return res.json({ items, balance: folio.balance });
  }
  res.json({ items: [], balance: 0 });
});

// ─── Admin Webhooks ───
app.get("/api/admin/webhooks", async (_req, res) => {
  if (pool) {
    const subscriptions = await query("SELECT * FROM webhook_subscriptions ORDER BY id DESC");
    const deliveries = await query("SELECT * FROM webhook_deliveries ORDER BY id DESC LIMIT 50");
    return res.json({ subscriptions, deliveries });
  }
  res.json({ subscriptions: [], deliveries: [] });
});

app.post("/api/admin/webhooks", async (req, res) => {
  const { target_url, events, secret } = req.body;
  if (pool) {
    const [sub] = await query(
      "INSERT INTO webhook_subscriptions (target_url, events, secret) VALUES ($1, $2, $3) RETURNING *",
      [target_url, events, secret]
    );
    return res.json({ subscription: sub });
  }
  res.status(501).json({ error: "Requires Database." });
});

app.post("/api/admin/webhooks/test", async (req, res) => {
  const { subscription_id } = req.body;
  if (pool) {
    const [sub] = await query("SELECT * FROM webhook_subscriptions WHERE id = $1", [subscription_id]);
    if (sub) {
      await deliverWebhook(sub, {
        event_id: crypto.randomUUID(),
        event_type: "system.test",
        event_version: "1.0",
        created_at: new Date().toISOString(),
        payload: { message: "Test event from NHPL Admin Console" }
      });
      return res.json({ ok: true });
    }
  }
  res.status(404).json({ error: "Subscription not found." });
});
app.use("/api", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

app.get("/screens/:slug", async (req, res) => {
  const filePath = SCREEN_MAP[req.params.slug];
  if (!filePath) return res.status(404).json({ error:"Screen not found" });
  let html = await fs.readFile(filePath, "utf8");
  const bridge = `<script>window.APEX_SCREEN=${JSON.stringify(req.params.slug)};</script><script src="/screen-bridge.js"></script>`;
  html = html.replace("</body>", `${bridge}</body>`);
  res.type("html").send(html);
});

app.get("/", (_req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));

// ─── Boot ───
if (process.env.NODE_ENV !== "production") {
  await initPostgres();
  await seedData();

  function startServer(port, attemptsLeft = 10) {
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`✅  NHPL prototype running at http://localhost:${port}`);
      console.log(`   Database mode: ${pool ? "Neon/Postgres" : "local memory fallback"}`);
      if (!process.env.APP_SEED_PASSWORD) {
        console.log(`   Generated one-time seed password: ${SEED_PASSWORD}`);
      }
    });
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
        console.log(`Port ${port} busy — trying ${port + 1}…`);
        startServer(port + 1, attemptsLeft - 1);
        return;
      }
      throw error;
    });
  }

  startServer(PORT);
}

export default app;
