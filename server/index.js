const express = require("express");
const app = express();
require("dotenv").config(); // Load environment variables from .env file
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import routes
const couponRoutes = require("./routes/couponRoutes");

// Define port number
const PORT = process.env.PORT || 3000;

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON requests
app.use(cookieParser()); // Parse cookies
app.set("trust proxy", true); // Enable proxy to get client IP address

require("./config/database").dbconnect(); // Connect to database

// Route setup
app.use("/coupon", couponRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("<h1>Hello Hi Bye</h1>"); // Simple response for root route
});

// Activate server
app.listen(PORT, () => {
  console.log("Server is running on port", PORT); // Log server activation
});
