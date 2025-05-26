import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import exclusive from "../../assets/bestseller.png";
import { useState,useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Modal from "react-modal";

// Make sure to bind modal to your appElement
Modal.setAppElement("#root");

const ForgotPasswordModal = ({ isOpen, onRequestClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      showMessage("Email is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/users/forgot-password-send-otp", { email });
      showMessage(response.data.message);
      setStep(2);
      setCanResend(false);
      setResendTimer(60);
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      showMessage("OTP is required", "error");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/users/verify-forgot-password-otp", { email, otp });
      setStep(3);
    } catch (error) {
      showMessage(error.response?.data?.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      showMessage("Password must be at least 8 characters and contain special characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/users/reset-password", {
        email,
        otp,
        newPassword,
      });
      showMessage(response.data.message);
      setTimeout(() => {
        onRequestClose();
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      }, 2000);
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setCanResend(false);
    setResendTimer(60);

    try {
      const response = await axiosInstance.post("/users/resend-forgot-password-otp", { email });
      showMessage(response.data.message);
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to resend OTP", "error");
      setCanResend(true);
      setResendTimer(0);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
            <p className="text-gray-600">Enter your email to receive a password reset OTP</p>
            
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
            <p className="text-gray-600">Enter the OTP sent to your email</p>
            
            <div>
              <input
                type="text"
                placeholder="OTP"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend || loading}
              className={`w-full px-4 py-3 text-rose-600 rounded-lg border border-rose-600 hover:bg-rose-50 transition-colors ${(!canResend || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
            <p className="text-gray-600">Enter your new password</p>
            
            <div>
              <input
                type="password"
                placeholder="New Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters and contain special characters
              </p>
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <button
          onClick={() => {
            onRequestClose();
            setStep(1);
            setEmail("");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
            {message.text}
          </div>
        )}
        
        {renderStep()}
      </div>
    </Modal>
  );
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/users/login", {
        email: data.email,
        password: data.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      setError("submit", { message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-rose-600 mb-2">
              Fashion Hub
            </h1>
            <p className="text-gray-600 text-lg">Login to your account</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.submit && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {errors.submit.message}
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Email"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <a
              href="/api/users/auth/google"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FcGoogle className="text-xl" />
              Continue with Google
            </a>

            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <p>
                Don't have an account?{" "}
                <a href="/signup" className="text-rose-600 hover:underline">
                  Sign Up
                </a>
              </p>
              <button
                type="button"
                onClick={() => setForgotPasswordModalOpen(true)}
                className="text-rose-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-rose-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-rose-600">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
      <div className="hidden md:block w-1/2 bg-rose-50">
        <img
          src={exclusive}
          alt="Shopping"
          className="w-full h-full object-cover"
        />
      </div>

      <ForgotPasswordModal 
        isOpen={forgotPasswordModalOpen} 
        onRequestClose={() => setForgotPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default Login;