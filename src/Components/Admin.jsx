import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Admin = () => {
  const [coupons, setCoupons] = useState([]);
  const [couponCount, setCouponCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    claimed: 0,
    unclaimed: 0,
    activeClaimCount: 0,
  });

  useEffect(() => {
    fetchCoupons();
    fetchDashboardStats();
  }, [filter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      let url = `${import.meta.env.VITE_BACKEND_URL}/coupon/?status=${filter}`;

      const response = await axios.get(url);
      setCoupons(response.data.data);

      // Fetch updated stats whenever we fetch coupons
      fetchDashboardStats();

      setLoading(false);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons");
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/coupon/dashboard-stats`
      );

      const dashboardData = response.data.data;

      setStats({
        total: dashboardData.coupons.total,
        claimed: dashboardData.coupons.claimed,
        unclaimed: dashboardData.coupons.unclaimed,
        activeClaimCount: dashboardData.coupons.activeClaimCount,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to fetch dashboard stats");
    }
  };

  const handleCreateCoupons = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/coupon/create`,
        {
          count: couponCount,
        }
      );

      toast.success(`${couponCount} coupons created successfully`);

      // Refresh data
      fetchDashboardStats();
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupons:", error);
      toast.error("Failed to create coupons");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Coupon Admin Panel</h1>

      {/* Coupon Stats */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Coupon Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-sm text-blue-800">Total Coupons</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-sm text-green-800">Unclaimed</p>
            <p className="text-3xl font-bold">{stats.unclaimed}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-sm text-red-800">Claimed</p>
            <p className="text-3xl font-bold">{stats.claimed}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <p className="text-sm text-purple-800">Active Claim Restrictions</p>
            <p className="text-3xl font-bold">{stats.activeClaimCount}</p>
          </div>
        </div>
      </div>

      {/* Generate Coupons */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Generate Coupons</h2>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            min="1"
            max="100"
            value={couponCount}
            onChange={(e) => setCouponCount(e.target.value)}
            className="border rounded px-3 py-2 w-24"
          />
          <button
            onClick={handleCreateCoupons}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Generate Coupons
          </button>
        </div>
      </div>

      {/* Coupon List */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Coupon List</h2>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded ${
                filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("claimed")}
              className={`px-3 py-1 rounded ${
                filter === "claimed" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Claimed
            </button>
            <button
              onClick={() => setFilter("unclaimed")}
              className={`px-3 py-1 rounded ${
                filter === "unclaimed"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Unclaimed
            </button>
          </div>
        </div>

        {/* Coupon Table */}
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {/* Table Header */}
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coupon Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Table Body */}
                {coupons.length > 0 ? (
                  coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">
                        {coupon.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            coupon.isClaimed
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {coupon.isClaimed ? "Claimed" : "Available"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center">
                      No coupons found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
