import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const OtpVerificationModal = ({ open, onClose, email }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    let interval;
    if (open && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open, timer]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/otp/verify-otp", {
        otp,
        email,
      });
      onClose(true); // Close with success
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await axiosInstance.post("/otp/resend-otp", { email });
      setTimer(120); // Reset timer
      setOtp(""); // Clear previous OTP
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center text-rose-600">
          Verify Your Email
        </h2>
        <p className="text-gray-600 text-center">
          Enter the OTP sent to your email. Time remaining:{" "}
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
        </p>
        
        <input
          type="text"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value);
            setError("");
          }}
          placeholder="Enter OTP"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div className="flex flex-col gap-2">
          <button
            onClick={handleVerifyOtp}
            disabled={loading || timer === 0}
            className={`w-full px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          
          <button
            onClick={handleResendOtp}
            disabled={loading || timer > 0}
            className={`w-full px-4 py-3 text-rose-600 border border-rose-600 rounded-lg hover:bg-rose-50 transition-colors ${
              loading || timer > 0 ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;