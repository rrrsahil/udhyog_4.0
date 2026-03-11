import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleRegister = async (e) => {
    e.preventDefault();

    const form = e.target;

    const data = {
      email: form.email.value,
      password: form.password.value,
    };

    try {
      await API.post("/auth/register", data);

      toast.success("Registration successful");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };
  return (
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
            <h1 className="auth-title">Create Account</h1>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-error" id="errorMessage">
              <i className="fas fa-exclamation-circle"></i>
              <span id="errorText"></span>
            </div>

            <div className="form-group-auth">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group-auth">
              <label htmlFor="password">
                <i className="fas fa-lock" /> Password
              </label>

              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a Strong Password"
                  required
                />

                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  ></i>
                </span>
              </div>
            </div>

            <div className="form-check">
              <input type="checkbox" id="terms" name="terms" required />
              <label htmlFor="terms">I agree to the Terms and Conditions</label>
            </div>

            <button type="submit" className="btn-auth">
              <i className="fas fa-user-plus"></i> Create Account
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
