const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* ===========================
   CHECK ENV VARIABLES FIRST
=========================== */

const requiredEnv = [
  "MYSQLHOST",
  "MYSQLUSER",
  "MYSQLPASSWORD",
  "MYSQLDATABASE",
  "MYSQLPORT"
];

requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing ENV variable: ${key}`);
  }
});

/* ===========================
   DATABASE CONNECTION
=========================== */

const dbConfig = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  connectTimeout: 10000
};

let db;

/* retry connection automatically */
function connectDatabase() {
  console.log("🔌 Connecting to MySQL...");

  db = mysql.createConnection(dbConfig);

  db.connect(err => {
    if (err) {
      console.error("❌ MySQL Connection Failed:", err.message);
      console.log("🔄 Retrying in 5 seconds...");
      setTimeout(connectDatabase, 5000);
    } else {
      console.log("✅ MySQL Connected Successfully");
    }
  });
}

connectDatabase();

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* ===========================
   PLACE ORDER
=========================== */

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
        console.error("❌ Order insert error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ message: "Order placed successfully 🎉" });
    }
  );
});

/* ===========================
   GET ORDERS (TEST)
=========================== */

app.get("/orders", (req, res) => {
  db.query("SELECT * FROM orders", (err, result) => {
    if (err) {
      console.error("❌ Fetch orders error:", err);
      return res.status(500).send(err);
    }
    res.json(result);
  });
});

/* ===========================
   START SERVER
=========================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

