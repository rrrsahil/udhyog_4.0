import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import API from "../api/api";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    const password = e.target["new-password"].value;
    const confirm = e.target["confirm-password"].value;

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await API.post(`/auth/reset-password/${token}`, { password });

      toast.success("Password reset successful");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img src={logo} alt="QPS Logo" />
            </div>
            <h1 className="auth-title">Create New Password</h1>
            <p className="auth-subtitle">Set a new password for your account</p>
          </div>

          <form className="auth-form" onSubmit={handleReset}>
            <div className="auth-success" id="successMessage">
              <i className="fas fa-check-circle"></i>
              <span id="successText">Password reset successfully!</span>
            </div>

            <div className="auth-error" id="errorMessage">
              <i className="fas fa-exclamation-circle"></i>
              <span id="errorText"></span>
            </div>

            <div className="alert alert-info">
              <i className="fas fa-lock"></i>
              Please enter your new password. Make sure it's at least 8 characters long.
            </div>

            <div className="form-group-auth">
              <label htmlFor="new-password">
                <i className="fas fa-lock"></i> New Password
              </label>
              <input
                type="password"
                id="new-password"
                name="new-password"
                placeholder="Enter your new password"
                required
                minLength={8}
              />
            </div>

            <div className="form-group-auth">
              <label htmlFor="confirm-password">
                <i className="fas fa-lock"></i> Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                placeholder="Confirm your new password"
                required
                minLength={8}
              />
            </div>

            <button type="submit" className="btn-auth">
              <i className="fas fa-save"></i> Reset Password
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <Link to="/">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
