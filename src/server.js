const app = require('./app.js');
const logger = require('./utils/logger.js');
const connectDB = require('./config/db.js');

const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to start server', err);
    process.exit(1);
  });
