const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();




// middleware
app.use(
  cors({
    origin: [
      "https://elraft-fashion-ql9x6lfqo-mohamed-shaliks-projects.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
  }),
);
app.options("*", cors());

app.use(express.json());
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

// database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/Elraft")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

module.exports = app; 
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
