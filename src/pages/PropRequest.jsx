import React, { useState } from "react";
import { CheckCircle, Clock, FileText, HelpCircle, Package, Send } from "lucide-react";
import axios from "axios";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const PropRequest = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    urgency: "normal",
    reason: "not-in-system",
    additionalInfo: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    "Costume",
    "Accessory & Props",
    "Makeup & Hair",
    "Set & Stage Decor"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("Please log in to submit a request");
      }

      const response = await axios.post(
        "http://localhost:3000/api/prop-request",
        {
          ...formData,
          userId,
          category: [formData.category], // Send as array to match Prop schema
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestId(response.data.requestId);
      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setCurrentStep(1);
        setRequestId(null);
        setFormData({
          name: "",
          category: "",
          urgency: "normal",
          reason: "not-in-system",
          additionalInfo: "",
        });
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  const displayRequestId = requestId ? `#${requestId.slice(0, 6)}` : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {isSubmitted ? (
          <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-white to-black/10 rounded-2xl shadow-xl my-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                <CheckCircle className="w-20 h-20 text-green-500 relative z-10" />
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black to-purple-600 mb-4">
                Request Submitted!
              </h2>
              <p className="text-gray-700 mb-8 text-center text-lg">
                We've received your prop request and notified the admin for approval. You'll be informed once a decision is made.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-md w-64 text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Request ID:</p>
                <p className="text-xl font-mono font-bold text-black">
                  {displayRequestId}
                </p>
              </div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2 bg-black text-white rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform hover:scale-105 shadow-md"
              >
                New Request
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-white to-black/10 rounded-2xl shadow-xl my-6 border border-gray-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-black p-3 rounded-full shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black to-purple-600">
                    Request a Prop
                  </h1>
                  <p className="text-gray-600">
                    Can't find the prop you're looking for? We'll help you get it!
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-between mb-8">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= 1 ? "bg-black text-white" : "bg-gray-200 text-gray-600"
                  } shadow-md`}
                >
                  1
                </div>
                <div className={`h-1 w-12 ${currentStep >= 2 ? "bg-black" : "bg-gray-200"}`}></div>
              </div>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= 2 ? "bg-black text-white" : "bg-gray-200 text-gray-600"
                  } shadow-md`}
                >
                  2
                </div>
                <div className={`h-1 w-12 ${currentStep >= 3 ? "bg-black" : "bg-gray-200"}`}></div>
              </div>
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full shadow-md"
                style={{
                  background: currentStep >= 3 ? "#000000" : "#e5e7eb",
                  color: currentStep >= 3 ? "white" : "#4b5563",
                }}
              >
                3
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="space-y-6 transition-all duration-300">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-black" />
                    Basic Prop Information
                  </h2>

                  <div className="group">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-black transition-colors"
                    >
                      Prop Name*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black pl-12 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        placeholder="Enter prop name"
                      />
                      <div className="absolute left-3 top-3 bg-black/10 p-1 rounded-md">
                        <Package className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-black transition-colors"
                    >
                      Category*
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black pl-12 appearance-none transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        <option value="" disabled>Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-3 bg-black/10 p-1 rounded-md">
                        <Package className="h-5 w-5 text-black" />
                      </div>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform hover:scale-[1.01] shadow-md disabled:opacity-50"
                    >
                      Continue
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 transition-all duration-300">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-black" />
                    Request Details
                  </h2>

                  <div className="group">
                    <label
                      htmlFor="urgency"
                      className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-black transition-colors"
                    >
                      How Urgent Is Your Request?
                    </label>
                    <div className="relative">
                      <select
                        id="urgency"
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black pl-12 appearance-none transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        <option value="low">Not Urgent</option>
                        <option value="normal">Somewhat Urgent</option>
                        <option value="high">Very Urgent</option>
                      </select>
                      <div className="absolute left-3 top-3 bg-black/10 p-1 rounded-md">
                        <Clock className="h-5 w-5 text-black" />
                      </div>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-black transition-colors"
                    >
                      Reason for Request
                    </label>
                    <div className="relative">
                      <select
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black pl-12 appearance-none transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        <option value="not-in-system">Prop not in system</option>
                        <option value="out-of-stock">Prop currently out of stock</option>
                        <option value="new-release">New prop not yet available</option>
                        <option value="other">Other reason</option>
                      </select>
                      <div className="absolute left-3 top-3 bg-black/10 p-1 rounded-md">
                        <HelpCircle className="h-5 w-5 text-black" />
                      </div>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={loading}
                      className="w-1/2 flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={loading}
                      className="w-1/2 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform hover:scale-[1.01] shadow-md disabled:opacity-50"
                    >
                      Continue
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 transition-all duration-300">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-black" />
                    Additional Information
                  </h2>

                  <div className="bg-black/10 border-l-4 border-black p-4 mb-6 rounded-r-lg">
                    <p className="text-sm text-black">
                      Please provide any additional details that might help us locate the prop you're looking for.
                    </p>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="additionalInfo"
                      className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-black transition-colors"
                    >
                      Additional Information
                    </label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      rows="4"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      placeholder="Any additional details about your request..."
                    ></textarea>
                  </div>

                  {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={loading}
                      className="w-1/2 flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform hover:scale-[1.01] shadow-md disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                      {loading ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PropRequest;