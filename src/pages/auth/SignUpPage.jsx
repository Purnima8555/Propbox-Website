import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaEnvelope, FaLock, FaPhone, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";

const SignUpPage = () => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const [errorMessages, setErrorMessages] = useState({
    fullname: "",
    username: "",
    email: "",
    contactNo: "",
    password: "",
    confirmPassword: "",
    terms: "",
    general: "",
  });
  const navigate = useNavigate();

  // Password validation rules
  const passwordRules = {
    minLength: { rule: password.length >= 8, message: "At least 8 characters" },
    uppercase: { rule: /[A-Z]/.test(password), message: "1 uppercase letter" },
    number: { rule: /\d/.test(password), message: "1 number" },
    specialChar: { rule: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: "1 special character" },
  };

  // Check if passwords match in real-time
  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (value && password) {
      setPasswordsMatch(value === password);
    } else {
      setPasswordsMatch(null);
    }
  };

  const resetErrorMessages = () => {
    setTimeout(() => {
      setErrorMessages({
        fullname: "",
        username: "",
        email: "",
        contactNo: "",
        password: "",
        confirmPassword: "",
        terms: "",
        general: "",
      });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {
      fullname: "",
      username: "",
      email: "",
      contactNo: "",
      password: "",
      confirmPassword: "",
      terms: "",
      general: "",
    };
    let formIsValid = true;

    // Validate required fields
    if (!fullname || !username || !email || !contactNo || !password || !confirmPassword) {
      errors.general = "*All fields are required!*";
      formIsValid = false;
    }

    // Validate password rules
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.password = "*Password must fulfill all requirements!*";
      formIsValid = false;
    }

    // Validate password match
    if (password !== confirmPassword) {
      errors.confirmPassword = "*Passwords do not match!*";
      formIsValid = false;
    }

    // Validate contact number (at least 10 digits, numeric only)
    if (!/^\d{10,}$/.test(contactNo)) {
      errors.contactNo = "*Contact number must be at least 10 digits and numeric!*";
      formIsValid = false;
    }

    // Check for existing username/email
    try {
      const response = await axios.post("https://localhost:3000/api/auth/check-user-exists", {
        username,
        email,
      });

      if (response.data.usernameExists) {
        errors.username = "*Username already exists!*";
        formIsValid = false;
      }
      if (response.data.emailExists) {
        errors.email = "*Email already exists!*";
        formIsValid = false;
      }
    } catch (error) {
      console.error("Error checking username/email:", error.response?.data || error);
      errors.general = error.response?.data?.message || "*Error checking user details!*";
      formIsValid = false;
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      errors.terms = "*You must accept the Terms and Conditions!*";
      formIsValid = false;
    }

    if (!formIsValid) {
      setErrorMessages(errors);
      resetErrorMessages();
      return;
    }

    const registerPayload = {
      full_name: fullname,
      username,
      email,
      contact_no: contactNo,
      password,
      confirmPassword,
      role: "User",
    };

    try {
      const response = await axios.post("https://localhost:3000/api/auth/register", registerPayload);
      const { userId, token, role } = response.data.customer;

      localStorage.setItem("userId", userId);
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      toast.success("Registered successfully!");
      navigate("/otp");
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Registration failed!";
      toast.error(errorMessage);
      setErrorMessages({
        ...errors,
        general: `*${errorMessage}*`,
      });
      resetErrorMessages();
    }
  };

  return (
    <div className="min-h-screen font-sans html:overflow-hidden">
      <Header />
      <div className="flex flex-col lg:flex-row w-full" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="w-full lg:w-1/2 h-64 lg:h-auto">
          <img
            src="/src/assets/images/left-section.png"
            alt="Side Banner"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="w-full lg:w-[30%] flex flex-col justify-center px-6 sm:px-10 lg:pl-20 bg-white py-10 lg:py-0">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10">SIGN UP</h2>

          {errorMessages.general && (
            <div className="text-red-500 text-sm mb-4 text-center">{errorMessages.general}</div>
          )}

          <div className="relative mb-6">
            <input
              type="text"
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder=" "
              className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black"
            />
            <label
              htmlFor="fullname"
              className={`absolute left-0 transition-all text-gray-700 text-base ${
                fullname ? "top-[-0.75rem] text-sm text-black" : "top-2 text-base"
              } peer-focus:top-[-0.75rem] peer-focus:text-sm peer-focus:text-black`}
            >
              Full Name
            </label>
            <FaUser className="absolute right-0 top-2 text-black" />
            {errorMessages.fullname && (
              <div className="text-red-500 text-xs mt-1">{errorMessages.fullname}</div>
            )}
          </div>

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
              className={`absolute left-0 transition-all text-gray-700 text-base ${
                username ? "top-[-0.75rem] text-sm text-black" : "top-2 text-base"
              } peer-focus:top-[-0.75rem] peer-focus:text-sm peer-focus:text-black`}
            >
              Username
            </label>
            <FaUser className="absolute right-0 top-2 text-black" />
            {errorMessages.username && (
              <div className="text-red-500 text-xs mt-1">{errorMessages.username}</div>
            )}
          </div>

          <div className="relative mb-6">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black"
            />
            <label
              htmlFor="email"
              className={`absolute left-0 transition-all text-gray-700 text-base ${
                email ? "top-[-0.75rem] text-sm text-black" : "top-2 text-base"
              } peer-focus:top-[-0.75rem] peer-focus:text-sm peer-focus:text-black`}
            >
              Email
            </label>
            <FaEnvelope className="absolute right-0 top-2 text-black" />
            {errorMessages.email && (
              <div className="text-red-500 text-xs mt-1">{errorMessages.email}</div>
            )}
          </div>

          <div className="relative mb-6">
            <input
              type="tel"
              id="contactNo"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              placeholder=" "
              className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black"
            />
            <label
              htmlFor="contactNo"
              className={`absolute left-0 transition-all text-gray-700 text-base ${
                contactNo ? "top-[-0.75rem] text-sm text-black" : "top-2 text-base"
              } peer-focus:top-[-0.75rem] peer-focus:text-sm peer-focus:text-black`}
            >
              Contact Number
            </label>
            <FaPhone className="absolute right-0 top-2 text-black" />
            {errorMessages.contactNo && (
              <div className="text-red-500 text-xs mt-1">{errorMessages.contactNo}</div>
            )}
          </div>

          <div className="relative mb-6">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (confirmPassword) {
                  setPasswordsMatch(e.target.value === confirmPassword);
                }
              }}
              placeholder=" "
              className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black"
            />
            <label
              htmlFor="password"
              className={`absolute left-0 transition-all text-gray-700 text-base ${
                password ? "top-[-0.75rem] text-sm text-black" : "top-2 text-base"
              } peer-focus:top-[-0.75rem] peer-focus:text-sm peer-focus:text-black`}
            >
              Password
            </label>
            <FaLock className="absolute right-0 top-2 text-black" />
            {errorMessages.password && (
              <div className="text-red-500 text-xs mt-1">{errorMessages.password}</div>
            )}
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
              className="peer w-full border-b border-gray-400 py-2 pr-10 text-gray-700 focus:outline-none focus:border-black"
            />
            <label
              htmlFor="confirm-password"
              className={`absolute left-0 transition-all text-gray-700 text-base ${
                confirmPassword ? "top-[-0.75rem] text-sm text-black" : "top-2 text-base"
              } peer-focus:top-[-0.75rem] peer-focus:text-sm peer-focus:text-black`}
            >
              Confirm Password
            </label>
            <FaLock className="absolute right-0 top-2 text-black" />
            {errorMessages.confirmPassword && (
              <div className="text-red-500 text-xs mt-1">{errorMessages.confirmPassword}</div>
            )}
            {passwordsMatch === true && confirmPassword && (
              <div className="text-green-500 text-xs mt-1">Passwords match!</div>
            )}
            {passwordsMatch === false && confirmPassword && (
              <div className="text-red-500 text-xs mt-1">Passwords do not match!</div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="terms" className="text-xs text-gray-600">
                I agree to the Terms & Conditions
              </label>
              {errorMessages.terms && (
                <div className="text-red-500 text-xs mt-1">{errorMessages.terms}</div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              className="w-40 bg-black text-white px-6 py-2 rounded-[10px] font-semibold shadow-lg text-lg"
            >
              Register
            </button>
          </div>

          <p className="text-center text-sm text-gray-700 mt-6">
            Already have an account?{" "}
            <a href="/otp" className="font-semibold underline text-black">
              SIGN IN
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;