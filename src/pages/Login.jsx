import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import logo from "../assets/logo1.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../assets/job.jpg";

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
      const response = await axios.post(
        "http://156.67.111.32:3120/api/auth/loginUser",
        { Email: formData.Email, Password: formData.Password }, // Fix: Using input values
        { withCredentials: true }
      );

      console.log("Login Response:", response.data);

      if (response.status == 200) {
        localStorage.setItem("authToken", response.data.token); // 🔹 Store token
        // alert("Login successful!");

        setIsAuthenticated(true);
        navigate("/joblistings");
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false); // Fix: Ensure this runs after try-catch
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-200 p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl border border-gray-300 overflow-hidden flex">
        {/* Left Section: Login Form */}
        <div className="flex flex-col justify-center items-center w-full sm:w-1/2 p-8">
          {/* Logo */}
          <img src={logo} alt="Logo" className="w-24 sm:w-32 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
          {error && <p className="text-red-600 mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            {/* Email Field */}
            <div className="mb-4 relative">
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                className="w-full  px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Email"
                required
              />
            </div>

            {/* Password Field */}
            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="Password"
                value={formData.Password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center mb-4 text-sm">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2"
                />
                Remember me
              </label>
              <a
                href="/forgot-password"
                className="text-gray-600 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="w-full sm:w-1/2 bg-[#5a3d2b] text-white font-semibold p-3 rounded-lg hover:bg-[#442c1f] transition duration-300 shadow-md"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Section: Background Image */}
        <div className="hidden sm:block w-1/2">
          <img
            src={backgroundImage}
            alt="Background"
            className="w-full h-full object-fill"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
