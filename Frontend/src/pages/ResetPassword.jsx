import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

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
          <img src="/image.png" className="auth-image" alt="img" />
        </div>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img src="logo.png" alt="QPS Logo" />
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
              Please enter your new password. Make sure it's at least 8
              characters long.
            </div>

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="new-password"
                name="new-password"
                placeholder="Enter your new password"
                required
                minLength={8}
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

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="confirm-password"
                name="confirm-password"
                placeholder="Confirm your new password"
                required
                minLength={8}
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
