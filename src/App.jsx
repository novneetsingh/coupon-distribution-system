import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./Components/Home";
import Admin from "./Components/Admin";
import Navbar from "./Components/Navbar";

const App = () => {
  return (
    <div className="w-screen min-h-screen bg-gray-100">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
