const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta_cambiar";

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];

  // No se envió token
  if (!authHeader) {
    return res.status(401).json({ error: "Token no enviado" });
  }

  // Debe venir como: "Bearer TOKEN"
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Formato de token inválido" });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Adjuntar usuario al req (opcional)
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o vencido" });
  }
}

module.exports = auth;
