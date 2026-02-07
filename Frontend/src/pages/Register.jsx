import React, { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import { useNavigate } from "react-router-dom";
import logopng from "../assets/logo.png";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [rollno, setRollno] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const navigate = useNavigate();

  const user = new URLSearchParams(window.location.search).get("u");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let res;
      if (user === 'faculty') {
        res = await API.post("/auth/register/faculty", {
          name: username,
          email,
          password,
        });
      } else {
        res = await API.post("/auth/register/student", {
          name: username,
          roll: rollno,
          password,
        });
      }

      setRegisterSuccess(true);
      toast.success(res.data.message || "Registered successfully!");
      setTimeout(() => navigate(`/login?u=${user}`), 1500);
    } catch (error) {
      let message = "Registration failed: An unknown error occurred.";

      if (error.response) {
        message =
          error.response.data?.message ||
          `Server error: Status ${error.response.status}`;
      } else if (error.request) {
        message =
          "Registration failed: Cannot reach the server. Check your network or base URL.";
      } else {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-green-100 via-green-50 to-green-100">
      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-2xl shadow-xl bg-white overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-green-600 to-green-400 text-white p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white bg-opacity-10"></div>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white bg-opacity-10"></div>

          <div className="relative z-10">
            <img src={logopng} className="w-56 h-14" alt="Logo" />
            <h1 className="text-3xl font-bold mb-3">{user} Registration</h1>
            <ul className="space-y-2 text-green-100 text-sm">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-white mr-2" /> Secure {user}
                account
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-white mr-2" /> Add internship
                records
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-white mr-2" /> Manage and export
                details
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user} Registration
            </h2>
            <p className="text-gray-600 text-sm">
              Enter your details to create a new {user} account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="John Doe"
                required
              />
            </div>

            {user === 'faculty' ?
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
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="faculty@example.com"
                  required
                />
              </div>
              :
              <div>
                <label
                  htmlFor="id"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Enter ID
                </label>
                <input
                  id="id"
                  type="text"
                  value={rollno}
                  onChange={(e) => setRollno(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Enter your Roll number"
                  required
                />
              </div>
            }

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
                  className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
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
              className={`w-full flex justify-center items-center py-3 rounded-lg shadow text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition text-sm ${isLoading || registerSuccess
                ? "bg-green-700 hover:bg-green-800"
                : "bg-gradient-to-r from-green-600 to-green-400 hover:opacity-90"
                }`}
            >
              {isLoading
                ? "Registering..."
                : registerSuccess
                  ? "Registered!"
                  : "Register"}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/login?u=${user}`)}
              className="w-full flex justify-center items-center py-3 rounded-lg shadow text-green-700 font-medium border border-green-600 hover:bg-green-50 transition text-sm"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
