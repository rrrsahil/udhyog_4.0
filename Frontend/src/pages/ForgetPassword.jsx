import React from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

const ForgetPassword = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;

    try {
      const res = await API.post("/auth/forgot-password", { email });

      /* popup message */
      toast.success("Reset link generated. Opening reset page...");

      /* open reset page automatically */
      if (res.data.resetLink) {
        setTimeout(() => {
          window.open(res.data.resetLink, "_self");
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending reset link");
    }
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-image-container">
            <div className="auth-img-text">
              <p className="img-head">Quality Prognosis System</p>
              <p className="img-text">
                This system helps predict manufacturing quality using Al-based
                neural network models. Upload & Username datasets, train
                intelligent models, and generate Enter your username accurate
                prognosis results in real time. The system supports intelligent
                monitoring, smart prediction, Password and decision-support
                analytics for modern manufacturing environments.
              </p>
              <div className="login-copyright">
                © {new Date().getFullYear()} Quality Prognosis System
              </div>
            </div>
            <img src="image.png" className="auth-image" alt="" />
          </div>
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <img src="logo.png" alt="QPS Logo" />
              </div>
              <h1 className="auth-title">Reset Password</h1>
              <p className="auth-subtitle">Recover your account access</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-error" id="errorMessage">
                <i className="fas fa-exclamation-circle"></i>
                <span id="errorText"></span>
              </div>

              <div className="alert alert-info">
                <i className="fas fa-info-circle"></i>
                Enter your email address and we'll send you a link to reset your
                password.
              </div>

              <div className="form-group-auth">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your registered email"
                  required
                />
              </div>

              <button type="submit" className="btn-auth">
                <i className="fas fa-paper-plane"></i> Send Reset Link
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="auth-footer">
              <p>
                Remember your password? <Link to="/">Login here</Link>
              </p>
              <p>
                Don't have an account? <Link to="/register">Register now</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
