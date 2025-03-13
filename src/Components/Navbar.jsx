import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">
          Coupon Distribution System
        </h1>
        <div className="space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            Admin
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
