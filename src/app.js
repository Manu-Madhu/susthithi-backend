require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const applicationRoutes = require("./routes/application.routes.js");
const errorHandler = require("./middlewares/errorHandler.midd.js");
const { createHomePage } = require("./config/info.js");

const bodyParser = require("body-parser");
const logger = require("./utils/logger.js");

const app = express();
// app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 100,
// });
// app.use(limiter);

// Routes
app.use("/api", applicationRoutes);

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// common page
app.get("/", (req, res) => {
  const homePage = createHomePage({ name: "Susthini Server" });
  return res.send(homePage);
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
