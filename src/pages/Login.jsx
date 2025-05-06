// src/components/Login.jsx
import { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import logo from "../assets/logo1.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import md5 from "crypto-js/md5";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ Email: "", Password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const hashedPassword = md5(formData.Password).toString();

      const response = await axios.post(
        "http://156.67.111.32:3120/api/auth/loginUser",
        {
          Email: formData.Email,
          Password: hashedPassword,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        localStorage.setItem("authToken", response.data.token);
        setIsAuthenticated(true);
        toast.success("Logged in successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => navigate("/joblistings"), 500);
      } else {
        setError(response.data.message || "Login failed. Please try again.");
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      setError("Invalid email or password. Please try again.");
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="flex min-h-screen bg-gray-100">
        <div className="hidden md:flex flex-col justify-center items-center bg-[#5e29f0] w-1/2 p-10 text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to b2y Infy Solutions</h2>
          <p className="text-center mb-8">
            Log in to update your personal information, check on the status of your
            application, or to communicate with our hiring team.
          </p>
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="text-2xl">✅</div>
              <span>Apply for Jobs</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl">⚙️</div>
              <span>Manage your account</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl">📋</div>
              <span>Status of your application</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-10">
          <div className="w-full max-w-sm">
            <img src={logo} alt="Logo" className="w-24 mb-6 mx-auto" />
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Sign In</h2>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full pl-10 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full pl-10 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="mr-2"
                  />
                  Remember Password?
                </label>
                <a href="/forgot-password" className="hover:underline">Forgot Password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Signing In..." : "LOGIN"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
