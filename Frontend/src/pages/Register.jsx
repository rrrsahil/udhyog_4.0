import React from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import {toast} from "react-toastify";

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const form = e.target;

    const data = {
      fullname: form.fullname.value,
      email: form.email.value,
      username: form.username.value,
      password: form.password.value,
      role: form.role.value
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
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img src="assets/logo.png" alt="QPS Logo" />
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join Quality Prognosis System</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-error" id="errorMessage">
              <i className="fas fa-exclamation-circle"></i>
              <span id="errorText"></span>
            </div>

            <div className="form-group-auth">
              <label htmlFor="fullname">
                <i className="fas fa-user"></i> Full Name
              </label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                placeholder="Enter your full name"
                required
              />
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
              <label htmlFor="username">
                <i className="fas fa-at"></i> Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="form-group-auth">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a strong password"
                required
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
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="form-group-auth">
              <label htmlFor="role">
                <i className="fas fa-user-shield"></i> Account Type
              </label>
              <select id="role" name="role" required>
                <option value="">Select account type</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
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
