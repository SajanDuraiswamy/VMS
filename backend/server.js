const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();
const app = express();

// CORS + JSON middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Debug logger
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// ✅ Serve QR/PDF files from tmp folder
app.use("/tmp", express.static(path.join(__dirname, "tmp")));

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/visitor", require("./routes/visitorRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on ${process.env.PORT}`)
);
