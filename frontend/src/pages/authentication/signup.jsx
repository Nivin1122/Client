import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import exclusive from "../../assets/bestseller.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import OtpVerificationModal from "../../components/models/verifyOtpModal";

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [formData, setFormData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // First send OTP
      await axiosInstance.post("/otp/send-otp", { email: data.email });
      
      // Store form data for later use after OTP verification
      setFormData({
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      
      setShowOtpModal(true);
      setSnackbar({
        open: true,
        message: "OTP sent to your email!",
        severity: "success",
      });
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send OTP";
      setSnackbar({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

const handleOtpVerificationSuccess = async () => {
  try {
    setLoading(true);
    
    // Create registration payload with consistent naming
    const registrationData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword  // Use confirmPassword (camelCase) consistently
    };

    const response = await axiosInstance.post("/users/register", registrationData);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      setSnackbar({
        open: true,
        message: "Registration successful!",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  } catch (error) {
    const message = error.response?.data?.message || "Registration failed";
    setSnackbar({
      open: true,
      message,
      severity: "error",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-white relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-rose-600 mb-2">
              Fashion Hub
            </h1>
            <p className="text-gray-600 text-lg">Create your account</p>
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
                placeholder="Username"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                {...register("username", {
                  required: "Username is required",
                  pattern: {
                    value: /^[a-zA-Z]+$/,
                    message: "Username should only contain letters and no spaces or special characters",
                  },
                  minLength: {
                    value: 4,
                    message: "Username must be more than 3 characters long",
                  },
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                    message: "Please enter a valid email address",
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
                    message: "Password must be at least 8 characters long",
                  },
                  pattern: {
                    value: /[!@#$%^&*(),.?":{}|<>]/,
                    message: "Password must contain at least one special character",
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) => {
                    if (watch("password") !== val) {
                      return "Passwords do not match";
                    }
                  },
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
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
                'Sign Up'
              )}
            </button>

            <div className="flex items-center justify-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <a
              href="https://client-1-6rax.onrender.com/api/users/auth/google"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FcGoogle className="text-xl" />
              Sign up with Google
            </a>

            <div className="flex justify-center text-sm text-gray-600 mt-2">
              <p>
                Already have an account?{" "}
                <a href="/login" className="text-rose-600 hover:underline">
                  Login
                </a>
              </p>
            </div>
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

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        open={showOtpModal}
        onClose={(success) => {
          setShowOtpModal(false);
          if (success) {
            handleOtpVerificationSuccess();
          }
        }}
        email={formData?.email || ""}
      />

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-md shadow-lg ${
            snackbar.severity === "error" 
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
  );
};

export default SignUp;