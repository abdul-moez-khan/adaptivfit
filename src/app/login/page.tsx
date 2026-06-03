"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signup, login, logout } from "@/lib/api/auth";
import { isTokenValid } from "@/lib/utils/token";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
  });

  // Check if user is already logged in
  useEffect(() => {
    setIsLoggedIn(isTokenValid());
  }, []);

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiry = setInterval(() => {
      const isValid = isTokenValid();
      setIsLoggedIn(isValid);
      if (!isValid) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTokenExpiry);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");

    // Real-time username validation
    if (name === "username" && value) {
      const usernamePattern = /^[a-zA-Z0-9_-\s]+$/;
      if (!usernamePattern.test(value)) {
        setUsernameError("Username can only contain letters, numbers, underscores (_), hyphens (-), and spaces");
      } else {
        setUsernameError("");
      }
    } else if (name === "username") {
      setUsernameError("");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for username validation error
    if (usernameError) {
      setError(usernameError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await signup(formData);
      setSuccess("Account created successfully! Please login.");
      setIsLogin(true);
      setFormData({
        email: formData.email,
        username: "",
        password: "",
        full_name: "",
      });
      setUsernameError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      setSuccess("Login successful! Redirecting...");
      setIsLoggedIn(true);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setUsernameError("");
    setShowPassword(false);
    setFormData({
      email: "",
      username: "",
      password: "",
      full_name: "",
    });
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-logo">
          <Image src="/logo.png" alt="AdaptivFit Logo" width={200} height={80} />
        </div>

        <div className="login-card">
          <h2 className="login-title">{isLogin ? "Login" : "Sign Up"}</h2>
          <p className="login-subtitle">
            {isLogin
              ? "Welcome back! Please login to your account."
              : "Create your account to get started."}
          </p>

          {isLoggedIn && (
            <div className="login-info">
              <p>You are already logged in.</p>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsLoggedIn(false);
                }}
                className="logout-btn"
              >
                Logout
              </button>
            </div>
          )}

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          <form onSubmit={isLogin ? handleLogin : handleSignup}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your username"
                    className={usernameError ? "input-error" : ""}
                  />
                  {usernameError && <div className="field-error">{usernameError}</div>}
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          <div className="login-toggle">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={toggleMode} className="toggle-link">
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

