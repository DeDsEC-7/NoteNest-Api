const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const saltRounds = parseInt(process.env.BCRYPT_SALT) || 10;

exports.register = async (req, res) => {
  console.log(req.body);
  const { firstname,lastname, email, password } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ firstname, lastname, email, password: hashed });
    return res.status(201).json({ user_id: user.user_id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    return res.json({
      user: {
        user_id: user.user_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        autosave: user.autosave,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
};

exports.updateProfile = async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  const userId = req.user.user_id; // assume JWT middleware sets req.user
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({ firstname, lastname, email, phone });
    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Profile update failed' });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.user_id;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, saltRounds);
    await user.update({ password: hashed });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Password change failed' });
  }
};

// Enable/Disable AutoSave
exports.setAutoSave = async (req, res) => {
  const { autosave } = req.body;
  const userId = req.user.user_id;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    console.log(autosave);
    await user.update({ autosave });
    return res.json({ success: true, autosave: user.autosave });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update AutoSave' });
  }
};
exports.deleteAccount = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Account deletion failed' });
  }
};
