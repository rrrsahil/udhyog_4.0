import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import API from "../api/api";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const form = e.target;

    const data = {
      username: form.username.value,
      password: form.password.value,
      role: form.role.value,
    };

    try {
      const res = await API.post("/auth/login", data);

      /* Save token */
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("role", res.data.user.role);

      toast.success("Login Successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };
  return (
    <>
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <img src={logo} alt="QPS Logo" />
              </div>
              <h1 className="auth-title">QPS</h1>
              <p className="auth-subtitle">Quality Prognosis System</p>
            </div>
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-error" id="errorMessage">
                <i className="fas fa-exclamation-circle" />
                <span id="errorText" />
              </div>
              <div className="form-group-auth">
                <label htmlFor="role">
                  <i className="fas fa-user-shield" /> Role
                </label>
                <select id="role" name="role" required="">
                  <option value="">Select your role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="form-group-auth">
                <label htmlFor="username">
                  <i className="fas fa-user" /> Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  required=""
                />
              </div>
              <div className="form-group-auth">
                <label htmlFor="password">
                  <i className="fas fa-lock" /> Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required=""
                />
              </div>
              <div className="form-check">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <button type="submit" className="btn-auth">
                <i className="fas fa-sign-in-alt" /> Login
              </button>
            </form>
            <div className="auth-links">
              <Link to="/forget-password">
                <i className="fas fa-question-circle" /> Forgot Password?
              </Link>
            </div>
            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/register">Create one here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
