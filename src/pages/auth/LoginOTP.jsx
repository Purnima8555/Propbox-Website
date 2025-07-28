import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";

const LoginWithOtp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [lockMessage, setLockMessage] = useState("");
  const navigate = useNavigate();

  // Helper to format time as MM:SS
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    console.log("Formatting time:", { ms, totalSeconds, minutes, seconds });
    return `${minutes}:${seconds}`;
  };

  // Initialize and update lockout timer
  useEffect(() => {
    const lockUntil = localStorage.getItem("lockUntil");
    const storedMessage = localStorage.getItem("lockMessage") || "Too many attempts.";

    if (lockUntil && parseInt(lockUntil) > Date.now()) {
      console.log("Lockout detected on mount:", { lockUntil, storedMessage, currentTime: Date.now() });
      setLockMessage(storedMessage);
      setLockRemaining(parseInt(lockUntil) - Date.now());

      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, parseInt(lockUntil) - now);
        console.log("Timer tick:", { remaining, formatted: formatTime(remaining), now, lockUntil });
        setLockRemaining(remaining);

        if (remaining <= 0) {
          console.log("Lockout expired, clearing localStorage");
          localStorage.removeItem("lockUntil");
          localStorage.removeItem("lockMessage");
          setLockRemaining(0);
          setLockMessage("");
          clearInterval(interval);
        }
      }, 1000);

      return () => {
        console.log("Cleaning up interval");
        clearInterval(interval);
      };
    } else if (lockUntil) {
      // Clear stale lockout
      console.log("Clearing stale lockout:", { lockUntil });
      localStorage.removeItem("lockUntil");
      localStorage.removeItem("lockMessage");
      setLockRemaining(0);
      setLockMessage("");
    }
  }, []);

  // Step 1: Login with username/password
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("*Username and password are required!*");
      return;
    }
    if (lockRemaining > 0) {
      toast.error(`${lockMessage} Try again in ${formatTime(lockRemaining)}.`);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("https://localhost:3000/api/auth/login", {
        username,
        password,
      });
      console.log("Login response:", response.data);
      if (response.data.message && response.data.message.includes("OTP sent")) {
        toast.success("OTP sent to your email. Please check and enter OTP.");
        setOtpSent(true);
      }
    } catch (error) {
      console.error("Login error:", error.response?.status, error.response?.data);
      if (error.response?.status === 429) {
        const msg = error.response?.data?.message?.message || "Too many login attempts.";
        const retryAfter = error.response?.data?.message?.retryAfter || error.response?.headers["retry-after"] || 600;
        const lockUntil = Date.now() + parseInt(retryAfter) * 1000;
        console.log("Rate limit hit:", { msg, retryAfter, lockUntil, currentTime: Date.now() });
        localStorage.setItem("lockUntil", lockUntil);
        localStorage.setItem("lockMessage", msg);
        setLockRemaining(parseInt(retryAfter) * 1000);
        setLockMessage(msg);
        toast.error(`${msg} Try again in ${formatTime(retryAfter * 1000)}.`);
      } else {
        toast.error(error.response?.data?.message || "*Invalid username or password!*");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle digit change for OTP inputs
  const handleDigitChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow only single digit or empty
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      document.getElementById(`digit-${index + 1}`).focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (!otp || otp.length !== 6) {
      toast.error("*Please enter a valid 6-digit OTP!*");
      return;
    }
    if (lockRemaining > 0) {
      toast.error(`${lockMessage} Try again in ${formatTime(lockRemaining)}.`);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("https://localhost:3000/api/auth/verify-otp", {
        username,
        otp,
      });
      console.log("OTP verify response:", response.data);
      const { token, role, userId } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
      toast.success("Logged in successfully!");
      const storedRole = localStorage.getItem("role");
      if (storedRole === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("OTP verify error:", error.response?.status, error.response?.data);
      if (error.response?.status === 429) {
        const msg = error.response?.data?.message?.message || "Too many OTP attempts.";
        const retryAfter = error.response?.data?.message?.retryAfter || error.response?.headers["retry-after"] || 600;
        const lockUntil = Date.now() + parseInt(retryAfter) * 1000;
        console.log("Rate limit hit:", { msg, retryAfter, lockUntil, currentTime: Date.now() });
        localStorage.setItem("lockUntil", lockUntil);
        localStorage.setItem("lockMessage", msg);
        setLockRemaining(parseInt(retryAfter) * 1000);
        setLockMessage(msg);
        toast.error(`${msg} Try again in ${formatTime(retryAfter * 1000)}.`);
      } else {
        toast.error(error.response?.data?.message || "*OTP verification failed!*");
      }
    } finally {
      setLoading(false);
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
          {lockRemaining > 0 && (
            <div className="mb-6 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md">
              <p className="text-base font-semibold">
                🔒 {lockMessage} Try again in{" "}
                <span className="font-mono text-lg bg-red-200 px-2 py-1 rounded">
                  {formatTime(lockRemaining)}
                </span>
              </p>
            </div>
          )}
          {!otpSent ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold mb-10">SIGN IN</h2>

              {/* Username Field */}
              <div className="relative mb-6">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=" "
                  className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
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
                  className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
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
                  <input
                    type="checkbox"
                    id="remember"
                    className="mr-2 disabled:opacity-50"
                    disabled={loading || lockRemaining > 0}
                  />
                  <label htmlFor="remember" className="text-xs text-gray-600">
                    Remember Me
                  </label>
                </div>
                <button
                  onClick={handleLogin}
                  className="w-40 bg-black text-white px-6 py-2 rounded-[10px] font-semibold shadow-lg text-lg transition duration-200 disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
                >
                  {loading ? "Sending OTP..." : lockRemaining > 0 ? "Locked Out" : "Login"}
                </button>
              </div>

              {/* Sign Up */}
              <p className="text-center text-sm text-gray-700 mt-6">
                No account yet?{" "}
                <a href="/signUp" className="font-semibold underline">
                  SIGN UP
                </a>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold mb-10">ENTER OTP</h2>

              {/* OTP Field */}
              <div className="flex justify-between mb-6 gap-2">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    id={`digit-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(e.target.value, i)}
                    className="w-10 h-12 text-center border-b-2 border-gray-400 text-lg focus:outline-none focus:border-black disabled:opacity-50"
                    disabled={loading || lockRemaining > 0}
                  />
                ))}
              </div>

              {/* Verify OTP Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={handleVerifyOtp}
                  className="w-40 bg-black text-white px-6 py-2 rounded-[10px] font-semibold shadow-lg text-lg transition duration-200 disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
                >
                  {loading ? "Verifying..." : lockRemaining > 0 ? "Locked Out" : "Verify OTP"}
                </button>
              </div>

              {/* Sign Up */}
              <p className="text-center text-sm text-gray-700 mt-6">
                No account yet?{" "}
                <a href="/signUp" className="font-semibold underline">
                  SIGN UP
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginWithOtp;