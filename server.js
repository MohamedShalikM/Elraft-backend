const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

// middleware
app.use(
  cors({
    origin: "https://elraft-fashion.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// 👇 THIS LINE IS CRITICAL
app.options("*", cors());
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
  console.log(`Server running on port 5000 ${PORT}`);
});
