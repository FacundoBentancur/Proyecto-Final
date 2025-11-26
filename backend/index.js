const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2/promise");
const auth = require("./middlewares/auth");   // ⬅️ Middleware agregado

const app = express();
app.use(cors());
app.use(express.json());

// --- Conexión a la base de datos ---
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecommerce"
});

// --- Rutas públicas (sin token) ---

// Servir JSON desde /frontend/data
app.use("/data", express.static(path.join(__dirname, "../frontend/data")));


// ==========================================================
// TODAS LAS RUTAS A PARTIR DE ACA REQUIEREN TOKEN
// ==========================================================
app.use(auth);


// --- ENDPOINT POST /cart (protegido) ---
app.post("/cart", async (req, res) => {
  try {
    const { user_id, items } = req.body;

    if (!user_id || !items || !items.length) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Nuevo carrito
    const [cartResult] = await db.query(
      "INSERT INTO carts (user_id) VALUES (?)",
      [user_id]
    );

    const cartId = cartResult.insertId;

    const values = items.map(i => [
      cartId,
      i.product_id,
      i.product_name,
      i.unit_cost,
      i.currency,
      i.quantity
    ]);

    await db.query(
      "INSERT INTO cart_items (cart_id, product_id, product_name, unit_cost, currency, quantity) VALUES ?",
      [values]
    );

    return res.json({ success: true, cart_id: cartId });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor." });
  }
});

app.listen(3000, () => {
  console.log("Backend corriendo en http://localhost:3000");
});
