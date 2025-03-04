import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/authpage.css";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get("mode") === "signup" ? false : true;

  const [isLogin, setIsLogin] = useState(initialMode);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const toggleAuthMode = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
    setError("");
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save user info to localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred during registration');
      }

      // Save user info to localStorage
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "signup");
  }, [searchParams]);

  return (
    <div className="auth-page-container">
      <div className="auth-page">
        <h2>{isLogin ? "Log in to PixelSpeak" : "Sign up for PixelSpeak"}</h2>

        {error && <div className="error-message">{error}</div>}

        {isLogin ? (
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Password:
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        ) : (
          <form className="signup-form" onSubmit={handleSignupSubmit}>
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Password:
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
        )}

        <p className="toggle-auth">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={toggleAuthMode} className="toggle-button">
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}