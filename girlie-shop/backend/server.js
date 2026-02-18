const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ===== DATABASE CONNECTION =====
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});


db.connect(err => {
  if(err) console.log(err);
  else console.log("✅ MySQL Connected");
});

// ===== PLACE ORDER =====
app.post("/place-order", (req, res) => {

  const { customerName, items, total } = req.body;

  const sql = `
  INSERT INTO orders (customer_name, items, total_price)
  VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [customerName, JSON.stringify(items), total],
    (err,result)=>{
      if(err) return res.status(500).send(err);
      res.send({message:"Order placed successfully"});
    }
  );
});

// ===== GET ALL ORDERS (ADMIN) =====
app.get("/orders", (req,res)=>{
  db.query("SELECT * FROM orders",(err,result)=>{
    if(err) return res.status(500).send(err);
    res.json(result);
  });
});

app.listen(5000,()=>console.log("🚀 Server running on port 5000"));

