require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const applicationRoutes = require('./routes/application.routes.js');
const errorHandler = require('./middlewares/errorHandler.midd.js');
const logger = require('./utils/logger.js');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100
});
app.use(limiter);

// Routes
app.use('/api', applicationRoutes);

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
