require("dotenv").config();
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const { createHomePage } = require("./config/info.js");
const applicationRoutes = require("./routes/application.routes.js");
const errorHandler = require("./middlewares/errorHandler.midd.js");

const logger = require("./utils/logger.js");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

const app = express();

const { user_dev_url, admin_dev_url, user_prod_url, admin_prod_url, NODE_ENV } =
  process.env;

app.use(cookieParser());

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || NODE_ENV === "development") {
      callback(null, true);
    } else {
      const allowedOrigins = [
        user_dev_url,
        admin_dev_url,
        user_prod_url,
        admin_prod_url,
      ];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin not allowed by CORS"));
      }
    }
  },
};

app.use(cors(corsOptions));
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", applicationRoutes);

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Default page
app.get("/", (req, res) => {
  const homePage = createHomePage({ name: "Susthini Server" });
  return res.send(homePage);
});

// Error handler (must be last)
app.use(errorHandler);

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.stack || err}`);
  process.exit(1);
});

module.exports = app;
