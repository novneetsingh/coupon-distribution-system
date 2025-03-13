const express = require("express");
const router = express.Router();

const { 
  claimCoupon, 
  getAllCoupons, 
  createCoupons,
  getDashboardStats
} = require("../controllers/couponController");

// Create multiple coupons
router.post("/create", createCoupons);

// Get all coupons
router.get("/", getAllCoupons);

// Claim a coupon
router.post("/claim", claimCoupon);

// Get all dashboard stats in a single call
router.get("/dashboard-stats", getDashboardStats);

module.exports = router;
