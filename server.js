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
      console.log('Starting server...');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
      
      await sequelize.authenticate();
      console.log('Database connected successfully.');
      
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (err) {
      console.error('Unable to start server:', err);
      console.error('Error details:', err.message);
      process.exit(1);
    }
  }
  
  startServer();
}