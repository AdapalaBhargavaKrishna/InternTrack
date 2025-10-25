import React, { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import logopng from "../assets/logo.png";
import API from "../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const data = res.data;

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      toast.success(data.message || "Login successful!");
      setTimeout(() => navigate("/add"), 1500);
    } catch (error) {
      let message = "Login failed. Please try again.";

      if (error.response) {
        message = error.response.data?.message || message;
      } else if (error.request) {
        message = "Cannot connect to server. Check your connection.";
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-purple-100 via-indigo-50 to-purple-100">
      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-2xl shadow-xl bg-white overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 to-indigo-600 text-white p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white bg-opacity-10"></div>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white bg-opacity-10"></div>

          <div className="relative z-10">
            <img src={logopng} className="w-56 h-14 invert" alt="Logo" />
            <h1 className="text-3xl font-bold mb-3">Faculty Access</h1>
            <ul className="space-y-2 text-purple-100 text-sm">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-white mr-2" /> Manage internship
                records
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-white mr-2" /> View, edit, and
                export details
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-white mr-2" /> Secure access for
                faculty only
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Faculty Login
            </h2>
            <p className="text-gray-600 text-sm">
              Enter your email and password to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                placeholder="faculty@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 rounded-lg shadow text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition text-sm ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full text-center text-purple-700 font-medium hover:text-purple-800 transition text-sm"
            >
              Don't have an account? Register here
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
