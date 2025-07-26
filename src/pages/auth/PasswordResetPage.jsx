import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Header from "../../components/Header.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PasswordResetPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reset error message after 3 seconds
  const resetErrorMessage = () => {
    setTimeout(() => {
      setErrorMessage("");
    }, 3000);
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
    setLoading(true);

    try {
      if (step === 1) {
        // Step 1: Send email to get verification code
        if (!email) {
          setErrorMessage("*Email is required!*");
          resetErrorMessage();
          return;
        }
        await axios.post("http://localhost:3000/api/auth/forgot-password", { email });
        setStep(2);
      } else if (step === 2) {
        // Step 2: Verify the 6-digit code
        if (code.length !== 6) {
          setErrorMessage("*Please enter a 6-digit code!*");
          resetErrorMessage();
          return;
        }
        await axios.post("http://localhost:3000/api/auth/verify-code", { email, code });
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
        if (newPassword.length < 8) {
          setErrorMessage("*Password must be at least 8 characters long!*");
          resetErrorMessage();
          return;
        }
        await axios.post("http://localhost:3000/api/auth/reset-password", {
          email,
          code,
          newPassword,
        });
        alert("Password successfully reset! Please log in with your new password.");
        navigate("/signIn");
      }
    } catch (error) {
      console.error(`Error in step ${step}:`, error);
      setErrorMessage(error.response?.data?.message || "*An error occurred. Please try again.*");
      resetErrorMessage();
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
                  className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black"
                  disabled={loading}
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
                className="w-48 bg-black text-white font-bold py-2 rounded-md shadow-md transition duration-200 mb-4"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Code"}
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
                    className="w-10 h-12 text-center border-b-2 border-gray-400 text-lg focus:outline-none focus:border-black"
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center gap-4 mb-4">
                <button
                  onClick={handleBack}
                  className="text-sm text-gray-600 underline hover:text-orange-400"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="w-32 bg-black text-white font-bold py-2 rounded-md shadow-md transition duration-200"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Code"}
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
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black"
                  disabled={loading}
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
              </div>

              <div className="relative mb-6">
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black"
                  disabled={loading}
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
              </div>

              <div className="flex justify-between items-center gap-4 mb-4">
                <button
                  onClick={handleBack}
                  className="text-sm text-gray-600 underline hover:text-orange-400"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="w-40 bg-black text-white font-bold py-2 rounded-md shadow-md transition duration-200"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </>
          )}

          {/* Bottom Sign-in Option */}
          <p className="text-sm text-center text-gray-600">
            Remember your password?{" "}
            <a
              href="/signIn"
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