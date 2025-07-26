import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";

const SignInPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("*Username and password are required!*");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        username,
        password,
      });

      const { userId, token, role } = response.data;
      localStorage.setItem("userId", userId);
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      toast.success("Logged in successfully!");

      if (role === "Admin") {
        navigate("/admin/dashboard");
      } else if (role === "User") {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("*Invalid username or password!*");
    }
  };

  return (
    <div className="min-h-screen font-sans html:overflow-hidden">
      <Header />
      <div className="flex flex-col lg:flex-row w-full" style={{ height: "calc(100vh - 64px)" }}>
        {/* Left Side */}
        <div className="w-full lg:w-1/2 h-64 lg:h-auto">
          <img
            src="/src/assets/images/left-section.png"
            alt="Side Banner"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[30%] flex flex-col justify-center px-6 sm:px-10 lg:pl-20 bg-white py-10 lg:py-0">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10">SIGN IN</h2>

          {/* Username Field */}
          <div className="relative mb-6">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder=" "
              className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black"
            />
            <label
              htmlFor="username"
              className={`absolute left-0 transition-all text-black text-base ${
                username ? "top-[-0.75rem] text-sm" : "top-2 text-base"
              }`}
            >
              Username
            </label>
            <FaUser className="absolute right-0 top-2 text-black" />
          </div>

          {/* Password Field */}
          <div className="relative mb-1">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black"
            />
            <label
              htmlFor="password"
              className={`absolute left-0 transition-all text-black text-base ${
                password ? "top-[-0.75rem] text-sm" : "top-2 text-base"
              }`}
            >
              Password
            </label>
            <FaLock className="absolute right-0 top-2 text-black" />
          </div>

          {/* Forgot Password */}
          <div className="text-right mt-0 mb-4">
            <a
              href="/reset-password"
              className="text-xs text-gray-400 hover:text-orange-400 hover:underline transition-all"
            >
              Forgot Password?
            </a>
          </div>

          {/* Remember Me + Login */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-xs text-gray-600">
                Remember Me
              </label>
            </div>
            <button
              onClick={handleSubmit}
              className="w-40 bg-black text-white px-6 py-2 rounded-[10px] font-semibold shadow-lg text-lg transition duration-200"
            >
              Login
            </button>
          </div>

          {/* Sign Up */}
          <p className="text-center text-sm text-gray-700 mt-6">
            No account yet?{" "}
            <a href="/signUp" className="font-semibold underline">
              SIGN UP
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
