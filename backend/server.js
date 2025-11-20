
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'coffeeshop',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432
});

// simple health
app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/api/products', async (req, res) => {
  const r = await pool.query('SELECT id, name, description, price, category, rating, image_color FROM products ORDER BY id');
  res.json(r.rows);
});

app.post('/api/orders', async (req, res) => {
  const { customerName, items, total } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const order = await client.query(
      'INSERT INTO orders (customer_name, total, status) VALUES ($1, $2, $3) RETURNING id, timestamp',
      [customerName || 'Guest', total || 0, 'Pending']
    );
    const orderId = order.rows[0].id;
    for (const it of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [orderId, it.id, it.quantity || 1]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, orderId });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error(err);
    res.status(500).json({ error: 'failed to create order' });
  } finally {
    client.release();
  }
});

app.get('/api/admin/orders', async (req, res) => {
  const q = `
    SELECT o.id, o.customer_name, o.total, o.status, o.timestamp,
    json_agg(json_build_object('product_id', p.id, 'name', p.name, 'quantity', oi.quantity)) as items
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    GROUP BY o.id
    ORDER BY o.id DESC
  `;
  const r = await pool.query(q);
  res.json(r.rows);
});

app.put('/api/admin/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await pool.query('UPDATE orders SET status=$1 WHERE id=$2', [status, id]);
  res.json({ success: true });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const r = await pool.query('SELECT id, username FROM admin_users WHERE username=$1 AND password=$2', [username, password]);
  if (r.rows.length === 0) return res.status(401).json({ error: 'invalid' });
  res.json({ token: 'fake-jwt-token', user: { name: r.rows[0].username } });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Backend listening on', port));
