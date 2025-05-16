// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Pega o token do cabeçalho Authorization: Bearer TOKEN
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Pega somente o token

  if (token == null) {
    return res.sendStatus(401); // Se não há token, não autorizado
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      console.error("Erro na verificação do token:", err.message);
      // Token inválido (expirado ou assinatura incorreta)
      return res.sendStatus(403); // Forbidden - token inválido
    }

    // Token é válido, anexa o payload (que contém id, email, etc.) ao request
    req.user = userPayload;
    next(); // Passa para a próxima função (o controller da rota)
  });
};

module.exports = authenticateToken;