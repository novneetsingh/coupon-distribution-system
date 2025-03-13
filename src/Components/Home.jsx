import React, { useState } from "react";
import axios from "axios";

const Home = () => {
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format seconds into minutes
  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)} minutes`;
  };

  const claimCoupon = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/coupon/claim`,
        {}
      );

      const data = response.data;
      if (response.status === 200) {
        setCoupon(data.data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);

      // Handle the specific error case when a user has already claimed a coupon
      if (error.response?.status === 429) {
        const timeRemaining = error.response.data.timeRemaining;

        if (timeRemaining) {
          const formattedTime = formatTime(timeRemaining);

          setError(
            `You have already claimed a coupon. Please try again after ${formattedTime}.`
          );
        } else {
          setError(error.response.data.message);
        }
      } else {
        setError("Something went wrong. Please try again later.");
      }
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Coupon Distribution System
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Get a unique coupon code instantly! Our system ensures fair
          distribution by limiting one coupon per user.
        </p>

        {error ? (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        ) : null}

        {coupon ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Congratulations!</p>
            <p>
              Your coupon code:{" "}
              <span className="font-mono font-bold">{coupon.code}</span>
            </p>
          </div>
        ) : null}

        <button
          onClick={claimCoupon}
          disabled={loading}
          className={`w-full px-4 py-2 text-white font-semibold rounded-lg shadow-md ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } transition-colors`}
        >
          {loading ? "Processing..." : "Claim Your Coupon"}
        </button>
      </div>
    </div>
  );
};

export default Home;
