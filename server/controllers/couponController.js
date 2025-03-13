const Coupon = require("../models/Coupon");
const ClaimedIP = require("../models/ClaimedIP");
const uuid = require("uuid");

// Create multiple coupons
exports.createCoupons = async (req, res) => {
  try {
    const { count = 1 } = req.body;

    // Limit the number of coupons that can be created at once
    const couponCount = Math.min(count, 100);

    const coupons = [];
    for (let i = 0; i < couponCount; i++) {
      coupons.push({ code: uuid.v4() });
    }

    const createdCoupons = await Coupon.insertMany(coupons);

    res.status(201).json({
      message: `Successfully created ${createdCoupons.length} coupons`,
      data: createdCoupons,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create coupons",
      error: error.message,
    });
  }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status === "claimed") {
      filter.isClaimed = true;
    } else if (status === "unclaimed") {
      filter.isClaimed = false;
    }

    const coupons = await Coupon.find(filter);

    res.status(200).json({
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get coupons",
      error: error.message,
    });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get coupon stats
    const totalCoupons = await Coupon.countDocuments();
    const claimedCount = await Coupon.countDocuments({ isClaimed: true });
    const unclaimedCount = await Coupon.countDocuments({ isClaimed: false });

    // Get active claim restrictions
    const activeClaimCount = await ClaimedIP.countDocuments();

    // Return all stats in a single response
    res.status(200).json({
      data: {
        coupons: {
          total: totalCoupons,
          claimed: claimedCount,
          unclaimed: unclaimedCount,
          activeClaimCount: activeClaimCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get dashboard stats",
      error: error.message,
    });
  }
};

// Claim a coupon with abuse prevention and round-robin distribution
exports.claimCoupon = async (req, res) => {
  try {
    // Get client's IP address from x-forwarded-for header
    // Extract only the first IP which is the original client IP
    let clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // If x-forwarded-for contains multiple IPs (comma separated), take only the first one
    if (clientIP?.includes(",")) {
      clientIP = clientIP.split(",")[0].trim();
    }

    // Check if the user's IP has already claimed a coupon
    const claimedIP = await ClaimedIP.findOne({ ip: clientIP });
    if (claimedIP) {
      // Calculate time remaining
      const currentTime = new Date();
      const expiryTime = new Date(claimedIP.createdAt.getTime() + 3600000); // Add 1 hour
      const timeRemaining = Math.max(
        0,
        Math.floor((expiryTime - currentTime) / 1000)
      ); // in seconds

      return res.status(429).json({
        message: "You have already claimed a coupon. Please try again later.",
        timeRemaining: timeRemaining,
      });
    }

    // If a cookie exists that indicates a recent claim
    if (req.cookies.couponClaimed) {
      return res.status(429).json({
        message: "You have already claimed a coupon. Please try again later.",
      });
    }

    // Find the next available coupon (round-robin)
    const coupon = await Coupon.findOneAndUpdate(
      { isClaimed: false },
      { isClaimed: true },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: "No available coupons" });
    }

    // Save the IP in the database with a 1-hour expiry
    await ClaimedIP.create({ ip: clientIP });

    // Set a cookie to prevent the same browser from claiming again immediately
    res.cookie("couponClaimed", true, {
      maxAge: 3600000, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use 'none' for cross-origin in production
      path: "/", // Make available on all paths
    });

    res
      .status(200)
      .json({ message: "Coupon claimed successfully", data: coupon });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to claim coupon", error: error.message });
  }
};
