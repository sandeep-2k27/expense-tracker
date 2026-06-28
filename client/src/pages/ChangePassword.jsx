import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import "../styles/ChangePassword.css";

const ChangePassword = () => {
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [loading, setLoading] = useState(false);
  //   const [message, setMessage] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (newPassword.length < 6) {
    //   return toast.error("Password must be at least 6 characters");
    // }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Password updated");

      setOld("");
      setNew("");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container change-password-container">
      <div className="change-password-card">
        <h2>Change Password 🔒</h2>

        {/* {message && (
          <p className="change-password-message">{message}</p>
        )} */}

        <form onSubmit={handleSubmit}>
          <div className="password-field">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOld(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowOld(!showOld)}>
              {showOld ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="password-field">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowNew(!showNew)}>
              {showNew ? "🙈" : "👁️"}
            </span>
          </div>

          <button disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
        <div className="change-password-links">
          <Link to="/profile">← Back to Profile</Link>

          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;