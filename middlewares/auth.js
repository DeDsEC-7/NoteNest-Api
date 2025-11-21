const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) return res.status(401).json({ error: 'No authorization header' });

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid auth header' });

  const token = parts[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.user_id);
    console.log(payload);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { user_id: user.user_id, email: user.email, firstname: user.firstname,lastname: user.lastname };
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticate };
