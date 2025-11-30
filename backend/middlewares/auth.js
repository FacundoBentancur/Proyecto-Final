const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta_cambiar";

function auth(req, res, next) {
  // Se obtiene el header Authorization:
  const authHeader = req.headers["authorization"];

  // Se valida que exista el token:
  if (!authHeader) {
    return res.status(401).json({ error: "Token no enviado" });
  }

  // Se separa el Bearer del token:
  const [scheme, token] = authHeader.split(" ");

  // Se valida el formato correcto:
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Formato de token inválido" });
  }

  try {
    // Se verifica el token con la clave secreta:
    const decoded = jwt.verify(token, JWT_SECRET);

    // Se guarda la info del usuario en req.user:
    req.user = decoded;
    next();

    // Si el token es falso o está vencido, se rechaza:
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o vencido" });
  }
}

module.exports = auth;
