import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    const { action, payload } = req.body;
    
    // Simplistic common endpoint to run queries
    if (action === 'getHotels') {
      const result = await pool.query('SELECT * FROM hotels ORDER BY id');
      return res.status(200).json({ data: result.rows });
    }
    if (action === 'getRestaurants') {
      const result = await pool.query('SELECT * FROM restaurants ORDER BY id');
      return res.status(200).json({ data: result.rows });
    }
    if (action === 'getTrips') {
      const result = await pool.query('SELECT * FROM trip_plans ORDER BY id DESC');
      return res.status(200).json({ data: result.rows });
    }
    if (action === 'getEvents') {
      const result = await pool.query('SELECT * FROM events ORDER BY id DESC LIMIT 10');
      return res.status(200).json({ data: result.rows });
    }
    
    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
