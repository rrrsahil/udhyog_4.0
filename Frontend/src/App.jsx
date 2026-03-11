import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import IndustrialModules from "./pages/IndustrialModules";
import Prognosis from "./pages/Prognosis";
import Diagnosis from "./pages/Diagnosis";
import Training from "./pages/Training";
import Result from "./pages/Result";
import UploadDataset from "./pages/UploadDataset";
import Help from "./pages/Help";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

import ScrollTopButton from "./components/ScrollTopButton";
import ScrollToTop from "./components/ScrollToTop";

import NotFound from "./components/NotFound";

import "./css/style.css";
import "./css/login.css";
import "./css/dashboard.css";
import "./css/prognosis.css";
import "./css/training.css";

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/modules" element={<IndustrialModules />} />
        </Route>

        {/* Protected + Header Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/prognosis" element={<Prognosis />} />
            <Route path="/training" element={<Training />} />
            <Route path="/analysis" element={<Diagnosis />} />
            <Route path="/result" element={<Result />} />
            <Route path="/upload-dataset" element={<UploadDataset />} />
            <Route path="/help" element={<Help />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ScrollTopButton />
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

export default App;
