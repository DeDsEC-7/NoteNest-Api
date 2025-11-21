require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// Test database connection and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to connect to database:', err);
    process.exit(1);
  }
}

startServer();
