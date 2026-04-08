const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");

require("dotenv").config();
const app = express();

const allowedOrigins = [
  "https://elraft-fashion.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) return true;

  // Allow Vercel preview deployments for this frontend project.
  return /^https:\/\/elraft-fashion(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);
};

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin, like Postman or server-to-server calls.
    if (!origin) return callback(null, true);

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

// database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

module.exports = app; 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
