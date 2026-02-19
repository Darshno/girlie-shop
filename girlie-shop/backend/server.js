const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* ===============================
   DATABASE CONNECTION (RAILWAY)
=============================== */

// Railway automatically provides DATABASE_URL
// Example: mysql://user:password@host:port/database

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found!");
  process.exit(1);
}
const db = mysql.createConnection(process.env.MYSQL_URL);


// connect to database
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
    process.exit(1);
  }
  console.log("✅ MySQL Connected");
});

/* ===============================
   CREATE TABLE IF NOT EXISTS
=============================== */

const createTableQuery = `
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100),
  items JSON,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

db.query(createTableQuery, (err) => {
  if (err) console.error("❌ Table creation error:", err);
  else console.log("✅ Orders table ready");
});

/* ===============================
   HEALTH CHECK
=============================== */

app.get("/", (req, res) => {
  res.send("🚀 Backend running");
});

/* ===============================
   PLACE ORDER
=============================== */

app.post("/place-order", (req, res) => {
  const { customerName, items, total } = req.body;

  if (!customerName || !items || !total) {
    return res.status(400).json({
      error: "Missing order data",
      received: req.body
    });
  }

  const sql = `
    INSERT INTO orders (customer_name, items, total_price)
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [customerName, JSON.stringify(items), total],
    (err, result) => {
      if (err) {
        console.error("❌ Insert error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ message: "Order placed successfully 🎉" });
    }
  );
});

/* ===============================
   GET ALL ORDERS
=============================== */

app.get("/orders", (req, res) => {
  db.query("SELECT * FROM orders", (err, result) => {
    if (err) {
      console.error("❌ Fetch error:", err);
      return res.status(500).send(err);
    }
    res.json(result);
  });
});

/* ===============================
   START SERVER
=============================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



