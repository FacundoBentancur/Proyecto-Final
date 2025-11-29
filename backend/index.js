const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const mariadb = require("mariadb");
const auth = require("./middlewares/auth");

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// CONEXIÓN A MARIADB
// ============================
const db = mariadb.createPool({
  host: "localhost",
  user: "node",
  password: "1234",
  database: "ecommerce",
  connectionLimit: 5
});

const JWT_SECRET = "clave_super_secreta_cambiar";

// ============================
// REGISTRO (DEVUELVE TOKEN)
// ============================
app.post("/register", (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }

  const usersPath = path.join(__dirname, "users.json");
  const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

  // verificar si existe
  const exists = users.find(u => u.usuario === usuario);

  if (exists) {
    return res.status(409).json({ error: "El nombre de usuario ya está tomado" });
  }

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    usuario,
    password
  };

  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  // generar token (igual que /login)
  const token = jwt.sign(
    { id: newUser.id, usuario: newUser.usuario },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({
    token,
    usuario: newUser.usuario,
    message: "Usuario registrado correctamente"
  });
});

// ============================
// LOGIN
// ============================
app.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  const users = JSON.parse(fs.readFileSync(path.join(__dirname, "users.json"), "utf8"));
  const found = users.find(u => u.usuario === usuario && u.password === password);

  if (!found) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const token = jwt.sign(
    { id: found.id, usuario: found.usuario },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  return res.json({ token, usuario: found.usuario });
});

// ============================
// RUTAS PÚBLICAS
// ============================
app.use("/data", express.static(path.join(__dirname, "../frontend/data")));

// ============================
// RUTAS PRIVADAS
// ============================
app.use(auth);

// ============================
// POST /cart
// ============================
app.post("/cart", async (req, res) => {
  let conn;
  try {
    const { user_id, items } = req.body;

    if (!user_id || !items || !items.length) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    conn = await db.getConnection();

    const cartResult = await conn.query(
      "INSERT INTO carts (user_id) VALUES (?)",
      [user_id]
    );

    // ✅ FIX DEFINITIVO PARA BIGINT
    const cartId = Number(cartResult.insertId);

    const values = items.map(i => [
      cartId,
      i.product_id,
      i.product_name,
      i.unit_cost,
      i.currency,
      i.quantity
    ]);

    await conn.batch(
      "INSERT INTO cart_items (cart_id, product_id, product_name, unit_cost, currency, quantity) VALUES (?, ?, ?, ?, ?, ?)",
      values
    );

    return res.json({
      success: true,
      cart_id: cartId
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: "Error en el servidor." });
  } finally {
    if (conn) conn.release();
  }
});

// ============================
// SERVER
// ============================
app.listen(3000, () => {
  console.log("Backend corriendo en http://localhost:3000");
});
