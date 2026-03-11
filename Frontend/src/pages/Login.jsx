import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();

    const form = e.target;

    const data = {
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const res = await API.post("/auth/login", data);

      /* Save token */
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isLoggedIn", true);

      toast.success("Login Successful");

      setTimeout(() => {
        navigate("/modules");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
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
              <h1 className="auth-title">Login Account</h1>
            </div>
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-error" id="errorMessage">
                <i className="fas fa-exclamation-circle" />
                <span id="errorText" />
              </div>
              <div className="form-group-auth">
                <label htmlFor="email">
                  <i className="fas fa-envelope" /> Email
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
                    placeholder="Enter your password"
                    required
                  />

                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={
                        showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                      }
                    ></i>
                  </span>
                </div>
              </div>
              <div className="form-check">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">Remember Me</label>
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
            <div className="divider">
              <span>OR</span>
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
