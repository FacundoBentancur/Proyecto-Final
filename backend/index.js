const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json()); // ← Necesario para recibir JSON

// --- Conexión a la base de datos ---
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",      // tu pass
  database: "ecommerce"
});

// Servir datos estáticos
app.use("/data", express.static(path.join(__dirname, "../frontend/Data")));

// --- ENDPOINT POST /cart ---
app.post("/cart", async (req, res) => {
  try {
    const { user_id, items } = req.body;

    if (!user_id || !items || !items.length) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Crear un nuevo carrito
    const [cartResult] = await db.query(
      "INSERT INTO carts (user_id) VALUES (?)",
      [user_id]
    );

    const cartId = cartResult.insertId;

    // Insertar ítems
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
