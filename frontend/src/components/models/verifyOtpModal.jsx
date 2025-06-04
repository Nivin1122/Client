import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const OtpVerificationModal = ({ open, onClose, email }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [timer, setTimer] = useState(60);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    let interval;
    if (open) {
      // Reset timer when modal opens
      setTimer(60);
      setTimerExpired(false);
      setOtp("");
      
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            setTimerExpired(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(otp)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid 6-digit OTP.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/otp/verify-otp", {
        otp,
        email,
      });
      setSnackbar({
        open: true,
        message: response.data.message,
        type: "success",
      });
      // Close modal and indicate success
      setTimeout(() => {
        onClose(true);
      }, 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to verify OTP.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/otp/resend-otp", { email });
      setSnackbar({
        open: true,
        message: response.data.message,
        type: "success",
      });
      setTimer(60);
      setTimerExpired(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to resend OTP.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "" });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Verify OTP</h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          We've sent a 6-digit verification code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-center text-lg tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          <div className="text-center">
            {timerExpired ? (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-rose-600 hover:text-rose-700 underline"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-gray-600">
                OTP expires in: <span className="font-semibold text-rose-600">{timer}</span> seconds
              </p>
            )}
          </div>
        </form>

        {/* Snackbar for notifications */}
        {snackbar.open && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`p-4 rounded-md shadow-lg ${
              snackbar.type === "error" 
                ? "bg-red-100 text-red-800" 
                : "bg-green-100 text-green-800"
            }`}>
              <div className="flex justify-between items-center">
                <div>{snackbar.message}</div>
                <button 
                  onClick={handleCloseSnackbar}
                  className="ml-4 text-lg font-bold"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtpVerificationModal;