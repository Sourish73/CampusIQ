

"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { sequelize } = require("./src/config/database");
const apiRouter = require("./src/routes/api");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(
  cors({
    origin(origin, callback) {
      const allowed = new Set([
        "http://localhost:3000",
        "http://localhost:5173",
        process.env.CLIENT_URL,
      ].filter(Boolean));
      if (!origin || allowed.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", apiRouter);
app.use("/", apiRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅  Database connection established.");

    // Sync models — use { alter: true } in dev, migrations in prod
    await sequelize.sync();
    console.log("✅  Database models synchronised.");

    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
      console.log(`📚  Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌  Failed to start server:", error);
    process.exit(1);
  }
})();
