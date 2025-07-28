import { useState, useEffect } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Header from "../../components/Header.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const PasswordResetPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [lockMessage, setLockMessage] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const navigate = useNavigate();

  // Password validation rules
  const passwordRules = {
    minLength: { rule: newPassword.length >= 8, message: "At least 8 characters" },
    uppercase: { rule: /[A-Z]/.test(newPassword), message: "1 uppercase letter" },
    number: { rule: /\d/.test(newPassword), message: "1 number" },
    specialChar: { rule: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword), message: "1 special character" },
  };

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
    const lockUntil = localStorage.getItem("resetLockUntil");
    const storedMessage = localStorage.getItem("resetLockMessage") || "Too many attempts.";

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
          localStorage.removeItem("resetLockUntil");
          localStorage.removeItem("resetLockMessage");
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
      console.log("Clearing stale lockout:", { lockUntil });
      localStorage.removeItem("resetLockUntil");
      localStorage.removeItem("resetLockMessage");
      setLockRemaining(0);
      setLockMessage("");
    }
  }, []);

  // Reset error message after 3 seconds
  const resetErrorMessage = () => {
    setTimeout(() => {
      setErrorMessage("");
    }, 3000);
  };

  // Check if passwords match in real-time
  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (value && newPassword) {
      setPasswordsMatch(value === newPassword);
    } else {
      setPasswordsMatch(null);
    }
  };

  // Handle digit input for verification code
  const handleDigitChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    const joinedCode = newDigits.join("");
    setCode(joinedCode);
  };

  // Handle form submission for each step
  const handleNext = async () => {
    setErrorMessage("");
    if (lockRemaining > 0) {
      setErrorMessage(`${lockMessage} Try again in ${formatTime(lockRemaining)}.`);
      resetErrorMessage();
      return;
    }
    setLoading(true);

    try {
      if (step === 1) {
        // Step 1: Send email to get verification code
        if (!email) {
          setErrorMessage("*Email is required!*");
          resetErrorMessage();
          return;
        }
        await axios.post("https://localhost:3000/api/auth/forgot-password", { email });
        setStep(2);
      } else if (step === 2) {
        // Step 2: Verify the 6-digit code
        if (code.length !== 6) {
          setErrorMessage("*Please enter a 6-digit code!*");
          resetErrorMessage();
          return;
        }
        await axios.post("https://localhost:3000/api/auth/verify-code", { email, code });
        setStep(3);
      } else if (step === 3) {
        // Step 3: Reset password
        if (!newPassword || !confirmPassword) {
          setErrorMessage("*Both password fields are required!*");
          resetErrorMessage();
          return;
        }
        if (newPassword !== confirmPassword) {
          setErrorMessage("*Passwords do not match!*");
          resetErrorMessage();
          return;
        }
        if (
          newPassword.length < 8 ||
          !/[A-Z]/.test(newPassword) ||
          !/\d/.test(newPassword) ||
          !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
        ) {
          setErrorMessage("*Password must fulfill all requirements!*");
          resetErrorMessage();
          return;
        }
        await axios.post("https://localhost:3000/api/auth/reset-password", {
          email,
          code,
          newPassword,
        });
        toast.success("Password successfully reset! Redirecting to sign in...");
        // Clear all relevant localStorage items to log out user
        localStorage.removeItem("resetLockUntil");
        localStorage.removeItem("resetLockMessage");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        setTimeout(() => {
          navigate("/otp");
        }, 2000); // Delay to show toast
      }
    } catch (error) {
      console.error(`Error in step ${step}:`, error.response?.status, error.response?.data);
      if (error.response?.status === 429) {
        const msg = error.response?.data?.message?.message || "Too many attempts.";
        const retryAfter = error.response?.data?.message?.retryAfter || error.response?.headers["retry-after"] || 120;
        const lockUntil = Date.now() + parseInt(retryAfter) * 1000;
        console.log("Rate limit hit:", { msg, retryAfter, lockUntil, currentTime: Date.now() });
        localStorage.setItem("resetLockUntil", lockUntil);
        localStorage.setItem("resetLockMessage", msg);
        setLockRemaining(parseInt(retryAfter) * 1000);
        setLockMessage(msg);
        setErrorMessage(`${msg} Try again in ${formatTime(retryAfter * 1000)}.`);
        resetErrorMessage();
      } else {
        setErrorMessage(error.response?.data?.message || "*An error occurred. Please try again.*");
        resetErrorMessage();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen font-sans html:overflow-hidden">
      <Header />
      <div
        className="flex flex-col lg:flex-row w-full"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {/* Left Side - Image */}
        <div className="w-full lg:w-1/2 h-64 lg:h-auto">
          <img
            src="/src/assets/images/left-section.png"
            alt="Side Banner"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-[30%] flex flex-col justify-center px-6 sm:px-10 lg:pl-20 bg-white py-10 lg:py-0">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Reset Password</h2>

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

          {errorMessage && (
            <div className="text-red-500 text-sm mb-4 text-center">{errorMessage}</div>
          )}

          {/* Step 1 – Enter Email */}
          {step === 1 && (
            <>
              <p className="text-sm text-gray-600 mb-8">
                Enter your email address and we’ll send you a 6-digit code to
                reset your password.
              </p>

              <div className="relative mb-6">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
                />
                <label
                  htmlFor="email"
                  className={`absolute left-0 transition-all text-black text-base ${
                    email ? "top-[-0.75rem] text-sm" : "top-2 text-base"
                  }`}
                >
                  Email
                </label>
                <FaEnvelope className="absolute right-0 top-2 text-black" />
              </div>

              <button
                onClick={handleNext}
                className="w-48 bg-black text-white font-bold py-2 rounded-md shadow-md transition duration-200 mb-4 disabled:opacity-50"
                disabled={loading || lockRemaining > 0}
              >
                {loading ? "Sending..." : lockRemaining > 0 ? "Locked Out" : "Send Code"}
              </button>
            </>
          )}

          {/* Step 2 – Enter Code */}
          {step === 2 && (
            <>
              <p className="text-sm text-gray-600 mb-8">
                We sent a 6-digit code to your email. Please enter it below.
              </p>

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

              <div className="flex justify-between items-center gap-4 mb-4">
                <button
                  onClick={handleBack}
                  className="text-sm text-gray-600 underline hover:text-orange-400 disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="w-32 bg-black text-white font-bold py-2 rounded-md shadow-md transition duration-200 disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
                >
                  {loading ? "Verifying..." : lockRemaining > 0 ? "Locked Out" : "Verify Code"}
                </button>
              </div>
            </>
          )}

          {/* Step 3 – New Password */}
          {step === 3 && (
            <>
              <p className="text-sm text-gray-600 mb-8">
                Enter and confirm your new password.
              </p>

              <div className="relative mb-6">
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (confirmPassword) {
                      setPasswordsMatch(e.target.value === confirmPassword);
                    }
                  }}
                  placeholder=" "
                  className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
                />
                <label
                  htmlFor="new-password"
                  className={`absolute left-0 transition-all text-black text-base ${
                    newPassword ? "top-[-0.75rem] text-sm" : "top-2 text-base"
                  }`}
                >
                  New Password
                </label>
                <FaLock className="absolute right-0 top-2 text-black" />
                <div className="text-xs mt-2">
                  {Object.entries(passwordRules).map(([key, { rule, message }]) => (
                    <div key={key} className="text-gray-600">
                      {rule ? "✔ " : "• "} {message}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mb-6">
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  placeholder=" "
                  className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
                />
                <label
                  htmlFor="confirm-password"
                  className={`absolute left-0 transition-all text-black text-base ${
                    confirmPassword ? "top-[-0.75rem] text-sm" : "top-2 text-base"
                  }`}
                >
                  Confirm Password
                </label>
                <FaLock className="absolute right-0 top-2 text-black" />
                {passwordsMatch === true && confirmPassword && (
                  <div className="text-green-500 text-xs mt-1">Passwords match!</div>
                )}
                {passwordsMatch === false && confirmPassword && (
                  <div className="text-red-500 text-xs mt-1">Passwords do not match!</div>
                )}
              </div>

              <div className="flex justify-between items-center gap-4 mb-4">
                <button
                  onClick={handleBack}
                  className="text-sm text-gray-600 underline hover:text-orange-400 disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="w-40 bg-black text-white font-bold py-2 rounded-md shadow-md transition duration-200 disabled:opacity-50"
                  disabled={loading || lockRemaining > 0}
                >
                  {loading ? "Resetting..." : lockRemaining > 0 ? "Locked Out" : "Reset Password"}
                </button>
              </div>
            </>
          )}

          {/* Bottom Sign-in Option */}
          <p className="text-sm text-center text-gray-600">
            Remember your password?{" "}
            <a
              href="/otp"
              className="font-semibold underline hover:text-orange-400"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;