const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        mensaje: 'Token de autenticación requerido'
      });
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({
        mensaje: 'Formato de token inválido'
      });
    }

    // Java utiliza el JWT_SECRET decodificado desde Base64.
    // Node debe utilizar exactamente la misma clave.
    const secretKey = Buffer.from(
      process.env.JWT_SECRET,
      'base64'
    );

    const decoded = jwt.verify(
      token,
      secretKey
    );

    req.user = decoded;

    next();

  } catch (error) {
    console.error('Error validando JWT:', error.message);

    return res.status(401).json({
      mensaje: 'Token inválido o expirado'
    });
  }
};

module.exports = authMiddleware;
