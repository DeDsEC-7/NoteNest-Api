require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Export the app for Vercel serverless functions
module.exports = app;

// Only start server if not in Vercel environment
if (require.main === module) {
  const { sequelize } = require('./models');
  
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
}