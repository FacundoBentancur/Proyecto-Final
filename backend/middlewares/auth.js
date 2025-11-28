const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta_cambiar";

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token no enviado" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Formato de token inválido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o vencido" });
  }
}

module.exports = auth;
